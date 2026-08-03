from datetime import datetime

from geoalchemy2 import Geometry, WKBElement
from geoalchemy2.shape import to_shape
from sqlalchemy import DateTime, Index, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Listing(Base):
    """A property listing. Postgres table `listings`.

    The Mongo document's nested `location` object is flattened into columns
    here, and the point is stored as a real PostGIS geometry so we can do
    spatial queries (radius search) later.
    """

    __tablename__ = "listings"
    __table_args__ = (
        # GiST index — the index type PostGIS uses for fast spatial lookups.
        Index("ix_listings_geom", "geom", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    type: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 = Rent, 2 = Sale
    house_type: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 = Apartment, 2 = House

    # --- location (flattened) ---
    country: Mapped[str | None] = mapped_column(String(2), nullable=True)  # ISO code, e.g. "PH"
    city_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    city_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    admin_name1: Mapped[str | None] = mapped_column(String(120), nullable=True)
    address_line1: Mapped[str | None] = mapped_column(String(200), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # PostGIS point, WGS84 (SRID 4326). Stored as (longitude, latitude).
    geom: Mapped[WKBElement | None] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
        nullable=True,
    )

    rooms_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    floors_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    floor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    area_total: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Convenience read-only views over the PostGIS point, so callers get plain
    # floats instead of the raw binary geometry. Computed in Python from `geom`.
    @property
    def latitude(self) -> float | None:
        return to_shape(self.geom).y if self.geom is not None else None

    @property
    def longitude(self) -> float | None:
        return to_shape(self.geom).x if self.geom is not None else None
