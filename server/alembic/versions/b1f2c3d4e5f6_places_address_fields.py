"""google places address fields

Swap the GeoNames-era `city_id` (int) for Google's `place_id` (str) and add
richer PH address columns: `barangay` (sub-locality) and `postal_code`.

Revision ID: b1f2c3d4e5f6
Revises: 226ed025e20c
Create Date: 2026-08-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b1f2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '226ed025e20c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("listings", sa.Column("place_id", sa.String(length=255), nullable=True))
    op.add_column("listings", sa.Column("barangay", sa.String(length=120), nullable=True))
    op.add_column("listings", sa.Column("postal_code", sa.String(length=20), nullable=True))
    op.drop_column("listings", "city_id")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("listings", sa.Column("city_id", sa.Integer(), nullable=True))
    op.drop_column("listings", "postal_code")
    op.drop_column("listings", "barangay")
    op.drop_column("listings", "place_id")
