from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.listing import Listing


async def get_listings(
    session: AsyncSession, *, limit: int = 50, offset: int = 0
) -> Sequence[Listing]:
    """Newest listings first, paginated."""
    result = await session.execute(
        select(Listing).order_by(Listing.id.desc()).limit(limit).offset(offset)
    )
    return result.scalars().all()


async def get_listing_by_id(session: AsyncSession, listing_id: int) -> Listing | None:
    """A single listing by primary key, or None if it doesn't exist."""
    return await session.get(Listing, listing_id)
