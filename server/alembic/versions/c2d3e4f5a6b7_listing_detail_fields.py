"""listing detail fields

Add bedrooms-adjacent detail columns: bathrooms, parking, furnished
(1=Unfurnished/2=Semi/3=Furnished), discount (percent), and an amenities
string array.

Revision ID: c2d3e4f5a6b7
Revises: b1f2c3d4e5f6
Create Date: 2026-08-06 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b1f2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("listings", sa.Column("bathrooms", sa.Integer(), nullable=True))
    op.add_column("listings", sa.Column("parking", sa.Integer(), nullable=True))
    op.add_column("listings", sa.Column("furnished", sa.Integer(), nullable=True))
    op.add_column("listings", sa.Column("discount", sa.Numeric(precision=5, scale=2), nullable=True))
    op.add_column("listings", sa.Column("amenities", sa.ARRAY(sa.String()), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("listings", "amenities")
    op.drop_column("listings", "discount")
    op.drop_column("listings", "furnished")
    op.drop_column("listings", "parking")
    op.drop_column("listings", "bathrooms")
