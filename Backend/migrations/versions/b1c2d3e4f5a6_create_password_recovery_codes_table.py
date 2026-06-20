"""create password recovery codes table

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f7
Create Date: 2026-06-20 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "a1b2c3d4e5f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "password_recovery_codes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code_hash", name="uq_password_recovery_codes_code_hash"),
    )
    op.create_index(
        "ix_password_recovery_codes_user_id", "password_recovery_codes", ["user_id"]
    )
    op.create_index(
        "ix_password_recovery_codes_expires_at",
        "password_recovery_codes",
        ["expires_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_password_recovery_codes_expires_at", table_name="password_recovery_codes"
    )
    op.drop_index(
        "ix_password_recovery_codes_user_id", table_name="password_recovery_codes"
    )
    op.drop_table("password_recovery_codes")
