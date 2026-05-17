from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Finance Ready API"
    app_env: str = "local"
    api_prefix: str = "/api/v1"
    cors_origins_raw: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    database_url: str = "postgresql+psycopg://finance:finance@localhost:5432/finance_ready"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()

