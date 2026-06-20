from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(env_file=".env.dev", env_file_encoding="utf-8")

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
    mail_provider: str = "none"
    gmail_sender_email: str = ""
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_refresh_token: str = ""
    gmail_redirect_uri: str = "http://localhost:8000/api/v1/gmail/callback"
    frontend_url: str = "http://localhost:5173"
    admin_setup_token: str = ""


settings = Settings()
