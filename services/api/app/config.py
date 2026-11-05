"""
App config loaded from environment variables via pydantic-settings.
All secrets are read here; never access os.environ directly elsewhere.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    roboflow_api_key: str = ""
    roboflow_model_id: str = "deepfashion2-m-10k/2"

    # Maximum allowed upload size in bytes (10 MB)
    max_upload_bytes: int = 10 * 1024 * 1024

    cors_origins: list[str] = [
        "http://localhost:8081",
        "http://localhost:19006",
    ]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Returns a cached Settings singleton."""
    return Settings()
