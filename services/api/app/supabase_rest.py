"""
Minimal Supabase PostgREST client for backend-only writes (service role, bypasses RLS).

Kept to plain httpx instead of adding supabase-py: the backend only needs insert/delete.
The service-role key is never logged or returned.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class SupabaseWriteError(RuntimeError):
    """A database write failed (network or PostgREST error)."""


class SupabaseRest:
    def __init__(self, url: str, service_role_key: str, timeout_seconds: float) -> None:
        self._base = f"{url.rstrip('/')}/rest/v1"
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }
        self._timeout = timeout_seconds

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        """Inserts one row and returns it as stored (ids, defaults, timestamps)."""
        try:
            response = httpx.post(
                f"{self._base}/{table}",
                json=row,
                headers={**self._headers, "Prefer": "return=representation"},
                timeout=self._timeout,
            )
        except httpx.HTTPError as exc:
            raise SupabaseWriteError(f"insert into {table} failed: {type(exc).__name__}") from exc

        if response.status_code not in (200, 201):
            # PostgREST error bodies contain no secrets; keep them for diagnosis.
            logger.error("Supabase insert into %s failed: HTTP %s %s", table, response.status_code, response.text[:300])
            raise SupabaseWriteError(f"insert into {table} failed with HTTP {response.status_code}")

        rows = response.json()
        if not isinstance(rows, list) or not rows:
            raise SupabaseWriteError(f"insert into {table} returned no row")
        return dict(rows[0])

    def delete_by_id(self, table: str, row_id: str) -> None:
        try:
            response = httpx.delete(
                f"{self._base}/{table}", params={"id": f"eq.{row_id}"}, headers=self._headers, timeout=self._timeout
            )
        except httpx.HTTPError as exc:
            raise SupabaseWriteError(f"delete from {table} failed: {type(exc).__name__}") from exc
        if response.status_code not in (200, 204):
            raise SupabaseWriteError(f"delete from {table} failed with HTTP {response.status_code}")
