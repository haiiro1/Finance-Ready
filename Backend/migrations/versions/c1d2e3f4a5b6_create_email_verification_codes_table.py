"""create email verification codes table

Revision ID: c1d2e3f4a5b6
Revises: b1c2d3e4f5a6
Create Date: 2026-06-20 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_verification_codes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code_hash", name="uq_email_verification_codes_code_hash"),
    )
    op.create_index(
        "ix_email_verification_codes_user_id", "email_verification_codes", ["user_id"]
    )
    op.create_index(
        "ix_email_verification_codes_expires_at",
        "email_verification_codes",
        ["expires_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_email_verification_codes_expires_at",
        table_name="email_verification_codes",
    )
    op.drop_index(
        "ix_email_verification_codes_user_id",
        table_name="email_verification_codes",
    )
    op.drop_table("email_verification_codes")
