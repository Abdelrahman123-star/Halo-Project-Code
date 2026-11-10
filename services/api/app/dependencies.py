"""
FastAPI dependency injection helpers including Supabase Bearer JWT verification.
Never logs raw tokens.
"""

from typing import Annotated

import httpx
from fastapi import Depends, Header, HTTPException
from pydantic import BaseModel

from app.ai.garment.schemas import ErrorDetail
from app.config import Settings, get_settings

SettingsDep = Annotated[Settings, Depends(get_settings)]


class AuthenticatedUser(BaseModel):
    id: str
    email: str | None = None
    access_token: str


async def verify_bearer_token(
    settings: SettingsDep,
    authorization: Annotated[str | None, Header()] = None,
) -> AuthenticatedUser:
    """
    Validates `Authorization: Bearer <token>` against Supabase Auth (`/auth/v1/user`).
    Raises 401 with standard HALO ErrorDetail if missing, malformed, or rejected.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail=ErrorDetail(
                code="unauthorized",
                message="Missing or malformed Authorization Bearer token.",
            ).model_dump(),
        )

    token = authorization[7:].strip()
    if not token:
        raise HTTPException(
            status_code=401,
            detail=ErrorDetail(
                code="unauthorized",
                message="Empty Bearer token.",
            ).model_dump(),
        )

    base_url = settings.supabase_url.strip().rstrip("/")
    anon_key = settings.supabase_anon_key.strip()
    if not base_url or not anon_key:
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(
                code="model_unavailable",
                message="SUPABASE_URL and SUPABASE_ANON_KEY must be configured on the server.",
            ).model_dump(),
        )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{base_url}/auth/v1/user",
                headers={
                    "apikey": anon_key,
                    "Authorization": f"Bearer {token}",
                },
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(
                code="model_unavailable",
                message="Authentication service temporarily unreachable.",
            ).model_dump(),
        ) from exc

    if resp.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail=ErrorDetail(
                code="unauthorized",
                message="Invalid or expired session token.",
            ).model_dump(),
        )

    payload = resp.json()
    user_id = payload.get("id")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=401,
            detail=ErrorDetail(
                code="unauthorized",
                message="Token did not resolve to a valid user.",
            ).model_dump(),
        )

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        access_token=token,
    )


AuthUserDep = Annotated[AuthenticatedUser, Depends(verify_bearer_token)]
