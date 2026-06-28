"""create financial categories table

Revision ID: e1f2a3b4c5d6
Revises: d1e2f3a4b5c6
Create Date: 2026-06-27 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "financial_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("normalized_name", sa.String(length=80), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("color_token", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_financial_categories"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_financial_categories_user_id",
        ),
        sa.CheckConstraint(
            "type IN ('income', 'expense')",
            name="ck_financial_categories_type",
        ),
        sa.UniqueConstraint(
            "user_id", "type", "normalized_name",
            name="uq_financial_categories_user_type_name",
        ),
    )
    op.create_index(
        "ix_financial_categories_user_type_deleted",
        "financial_categories",
        ["user_id", "type", "deleted_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_financial_categories_user_type_deleted",
        table_name="financial_categories",
    )
    op.drop_table("financial_categories")
