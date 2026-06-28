"""drop gmail credentials table

Revision ID: f2b3c4d5e6a7
Revises: e1f2a3b4c5d6
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f2b3c4d5e6a7"
down_revision: Union[str, None] = "e1f2a3b4c5d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_gmail_credentials_email", table_name="gmail_credentials")
    op.drop_table("gmail_credentials")


def downgrade() -> None:
    op.create_table(
        "gmail_credentials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("token_json", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_gmail_credentials_email"),
    )
    op.create_index(
        "ix_gmail_credentials_email", "gmail_credentials", ["email"], unique=False
    )
