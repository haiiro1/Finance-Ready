import re
import unicodedata
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, Index, UniqueConstraint
from sqlmodel import Field, SQLModel


def visible_name(name: str) -> str:
    """NFKC-normalize and collapse whitespace, preserving original case."""
    normalized = unicodedata.normalize("NFKC", name)
    return re.sub(r"\s+", " ", normalized.strip())


def normalize_name(name: str) -> str:
    """Return casefold comparison key for duplicate detection."""
    return visible_name(name).casefold()


class FinancialCategory(SQLModel, table=True):
    __tablename__ = "financial_categories"
    __table_args__ = (
        CheckConstraint("type IN ('income', 'expense')", name="ck_financial_categories_type"),
        UniqueConstraint(
            "user_id", "type", "normalized_name",
            name="uq_financial_categories_user_type_name",
        ),
        Index("ix_financial_categories_user_type_deleted", "user_id", "type", "deleted_at"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    name: str = Field(nullable=False, max_length=80)
    normalized_name: str = Field(nullable=False, max_length=80)
    type: str = Field(nullable=False)
    color_token: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: datetime | None = Field(default=None, nullable=True)
