from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "find-place-api"
    environment: str = "development"

    # Postgres (async driver). Overridden via DATABASE_URL in the environment.
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/findplace"

    # Origins allowed to call the API (the Next.js client).
    cors_origins: list[str] = ["http://localhost:3050"]

    # Google AI Studio (Gemini free tier) — powers the AI chat search.
    gemini_api_key: str | None = None
    # Pinned to a concrete model, not the "latest" alias — that alias 503'd
    # repeatedly in testing (2026-09-22), while this concrete version answered
    # immediately. Check https://ai.google.dev/gemini-api/docs/models for the
    # current lineup if this one gets deprecated; override via GEMINI_MODEL.
    gemini_model: str = "gemini-3.8-flash"

    # Google Geocoding API — resolves place names (e.g. "BGC, Taguig") to
    # lat/lng for radius search. Must be a SERVER-restricted key (IP
    # restriction), never the client's browser-restricted maps key.
    google_geocoding_api_key: str | None = None


settings = Settings()
