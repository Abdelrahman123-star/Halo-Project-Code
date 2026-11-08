"""
App config loaded from environment variables via pydantic-settings.
All secrets are read here; never access os.environ directly elsewhere.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    roboflow_api_key: str = ""
    roboflow_model_id: str = "deepfashion2-m-10k/2"

    # Maximum allowed upload size in bytes (10 MB), applied per file
    max_upload_bytes: int = 10 * 1024 * 1024

    # Supabase — backend only. The service-role key bypasses RLS and must never reach the app.
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    # Public anon key (same one the app has). Enough to verify user tokens; cannot write data.
    supabase_anon_key: str = ""
    supabase_timeout_seconds: float = 10.0

    # Directory holding the MediaPipe .task files (scripts/download_models.py)
    avatar_models_dir: str = str(Path(__file__).resolve().parent.parent / "models")

    cors_origins: list[str] = [
        "http://localhost:8081",
        "http://localhost:19006",
    ]

    @property
    def _supabase_url_set(self) -> bool:
        url = self.supabase_url.strip()
        return bool(url) and "your-project" not in url

    @staticmethod
    def _key_set(key: str) -> bool:
        key = key.strip()
        return bool(key) and not key.startswith("your_")

    @property
    def supabase_configured(self) -> bool:
        """True when the backend can WRITE to Supabase (service-role key present)."""
        return self._supabase_url_set and self._key_set(self.supabase_service_role_key)

    @property
    def supabase_auth_key(self) -> str | None:
        """Key used as `apikey` when verifying user tokens: service role if set, else the anon key."""
        if not self._supabase_url_set:
            return None
        for key in (self.supabase_service_role_key, self.supabase_anon_key):
            if self._key_set(key):
                return key.strip()
        return None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Returns a cached Settings singleton."""
    return Settings()
