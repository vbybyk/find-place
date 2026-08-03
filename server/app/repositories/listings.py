from collections.abc import Sequence

from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.listing import Listing


def _to_geom(latitude: float | None, longitude: float | None):
    """Build a PostGIS point from lat/lng, or None if either is missing."""
    if latitude is None or longitude is None:
        return None
    # PostGIS stores points as (x=longitude, y=latitude).
    return from_shape(Point(longitude, latitude), srid=4326)


async def get_listings(
    session: AsyncSession,
    *,
    limit: int = 50,
    offset: int = 0,
    type: int | None = None,
    house_type: int | None = None,
    user_id: int | None = None,
    city: str | None = None,
) -> Sequence[Listing]:
    """Newest listings first, paginated, with optional filters."""
    stmt = select(Listing)
    if type is not None:
        stmt = stmt.where(Listing.type == type)
    if house_type is not None:
        stmt = stmt.where(Listing.house_type == house_type)
    if user_id is not None:
        stmt = stmt.where(Listing.user_id == user_id)
    if city is not None:
        stmt = stmt.where(Listing.city_label.ilike(f"%{city}%"))

    stmt = stmt.order_by(Listing.id.desc()).limit(limit).offset(offset)
    result = await session.execute(stmt)
    return result.scalars().all()


async def get_listing_by_id(session: AsyncSession, listing_id: int) -> Listing | None:
    """A single listing by primary key, or None if it doesn't exist."""
    return await session.get(Listing, listing_id)


async def create_listing(session: AsyncSession, data: dict) -> Listing:
    """Insert a listing. `data` holds column values plus latitude/longitude."""
    geom = _to_geom(data.pop("latitude", None), data.pop("longitude", None))
    listing = Listing(**data, geom=geom)
    session.add(listing)
    await session.flush()  # send INSERT so the DB assigns the id / defaults
    await session.refresh(listing)  # reload (incl. created_at) from the row
    return listing


async def update_listing(
    session: AsyncSession, listing_id: int, data: dict
) -> Listing | None:
    """Apply a partial update. Returns None if the listing doesn't exist."""
    listing = await session.get(Listing, listing_id)
    if listing is None:
        return None

    lat = data.pop("latitude", None)
    lng = data.pop("longitude", None)
    if lat is not None and lng is not None:
        listing.geom = _to_geom(lat, lng)

    for key, value in data.items():
        setattr(listing, key, value)

    await session.flush()
    await session.refresh(listing)
    return listing


async def delete_listing(session: AsyncSession, listing_id: int) -> bool:
    """Delete by id. Returns True if a row was removed, False if not found."""
    listing = await session.get(Listing, listing_id)
    if listing is None:
        return False
    await session.delete(listing)
    await session.flush()
    return True
