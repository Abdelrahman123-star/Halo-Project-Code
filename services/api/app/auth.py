"""
Supabase access-token verification.

The token is checked by Supabase itself (`GET /auth/v1/user`), which works for any
JWT signing setup and also rejects revoked sessions. The token is never logged.
"""

from __future__ import annotations

import logging
import uuid
from typing import Annotated

import httpx
from fastapi import Depends, Header

from app.config import Settings, get_settings
from app.errors import ApiError

logger = logging.getLogger(__name__)


def _bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise ApiError(401, "unauthorized", "Sign in to continue.")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise ApiError(401, "unauthorized", "Sign in to continue.")
    return token.strip()


def require_supabase_auth(settings: Settings) -> str:
    """Returns the key used to verify tokens, or raises if the server cannot verify logins."""
    key = settings.supabase_auth_key
    if key is None:
        raise ApiError(
            503,
            "server_not_configured",
            "The server is missing its Supabase configuration (SUPABASE_URL + SUPABASE_ANON_KEY).",
        )
    return key


def get_current_user_id(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    token = _bearer_token(authorization)
    api_key = require_supabase_auth(settings)

    try:
        response = httpx.get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers={"apikey": api_key, "Authorization": f"Bearer {token}"},
            timeout=settings.supabase_timeout_seconds,
        )
    except httpx.HTTPError as exc:
        logger.warning("Supabase auth check failed: %s", type(exc).__name__)
        raise ApiError(503, "auth_unavailable", "Could not verify your session. Please try again.") from exc

    if response.status_code in (401, 403):
        raise ApiError(401, "unauthorized", "Your session has expired. Please sign in again.")
    if response.status_code != 200:
        logger.warning("Supabase auth check returned HTTP %s", response.status_code)
        raise ApiError(503, "auth_unavailable", "Could not verify your session. Please try again.")

    user_id = str(response.json().get("id", ""))
    try:
        uuid.UUID(user_id)
    except ValueError as exc:
        raise ApiError(401, "unauthorized", "Your session could not be verified.") from exc
    return user_id


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
