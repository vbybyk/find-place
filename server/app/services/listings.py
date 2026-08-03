from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import listings as listings_repo
from app.schemas.listing import ListingRead


async def list_listings(
    session: AsyncSession, *, limit: int = 50, offset: int = 0
) -> list[ListingRead]:
    """Fetch listings and map the ORM rows to the API response shape."""
    rows = await listings_repo.get_listings(session, limit=limit, offset=offset)
    return [ListingRead.model_validate(row) for row in rows]


async def get_listing(session: AsyncSession, listing_id: int) -> ListingRead | None:
    row = await listings_repo.get_listing_by_id(session, listing_id)
    if row is None:
        return None
    return ListingRead.model_validate(row)
