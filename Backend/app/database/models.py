from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class MigrationCheck(SQLModel, table=True):
    __tablename__ = "migration_checks"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
