"""create listings table

Revision ID: 226ed025e20c
Revises:
Create Date: 2026-07-31 14:12:06.786193

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = '226ed025e20c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # PostGIS must exist before we can create a geometry column. Idempotent.
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "listings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("type", sa.Integer(), nullable=False),
        sa.Column("house_type", sa.Integer(), nullable=False),
        sa.Column("country", sa.String(length=2), nullable=True),
        sa.Column("city_id", sa.Integer(), nullable=True),
        sa.Column("city_label", sa.String(length=120), nullable=True),
        sa.Column("admin_name1", sa.String(length=120), nullable=True),
        sa.Column("address_line1", sa.String(length=200), nullable=True),
        sa.Column("address_line2", sa.String(length=200), nullable=True),
        sa.Column(
            "geom",
            Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=True,
        ),
        sa.Column("rooms_number", sa.Integer(), nullable=True),
        sa.Column("floors_number", sa.Integer(), nullable=True),
        sa.Column("floor", sa.Integer(), nullable=True),
        sa.Column("area_total", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("images", sa.ARRAY(sa.String()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # GiST index for fast spatial lookups (used later by radius search).
    op.create_index(
        "ix_listings_geom", "listings", ["geom"], postgresql_using="gist"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_listings_geom", table_name="listings")
    op.drop_table("listings")
