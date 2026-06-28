from datetime import datetime, timezone

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class EmailVerificationCode(SQLModel, table=True):
    __tablename__ = "email_verification_codes"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    code_hash: str = Field(index=True, unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)
    used_at: datetime | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )


class PasswordRecoveryCode(SQLModel, table=True):
    __tablename__ = "password_recovery_codes"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    code_hash: str = Field(index=True, unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)
    used_at: datetime | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )


class MigrationCheck(SQLModel, table=True):
    __tablename__ = "migration_checks"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    full_name: str | None = Field(default=None)
    hashed_password: str | None = Field(default=None, nullable=True)
    is_active: bool = Field(default=True, nullable=False)
    email_verified: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )


class UserIdentity(SQLModel, table=True):
    __tablename__ = "user_identities"
    __table_args__ = (
        UniqueConstraint(
            "provider", "provider_subject", name="uq_user_identities_provider_subject"
        ),
        UniqueConstraint("user_id", "provider", name="uq_user_identities_user_provider"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    provider: str = Field(nullable=False)
    provider_subject: str = Field(nullable=False)
    provider_email: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
