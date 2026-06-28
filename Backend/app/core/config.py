from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env.dev", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "Finance Ready API"
    app_env: str = "local"
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173"
    database_url: str = "postgresql+psycopg://finance:finance@localhost:5432/finance_ready"
    secret_key: str = "dev-secret-change-me-in-production"
    access_token_expire_minutes: int = 30
    jwt_algorithm: str = "HS256"
    password_recovery_code_expire_minutes: int = 15
    email_verification_code_expire_minutes: int = 30
    resend_api_key: str = ""
    email_from: str = ""
    email_from_name: str = "Finance Ready"
    frontend_url: str = "http://localhost:5173"
    admin_setup_token: str = ""
    google_client_id: str = ""


settings = Settings()
