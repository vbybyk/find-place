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


settings = Settings()
