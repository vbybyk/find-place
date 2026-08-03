from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import listings as listings_repo
from app.schemas.listing import ListingCreate, ListingRead, ListingUpdate


async def list_listings(
    session: AsyncSession,
    *,
    limit: int = 50,
    offset: int = 0,
    type: int | None = None,
    house_type: int | None = None,
    user_id: int | None = None,
    city: str | None = None,
) -> list[ListingRead]:
    """Fetch listings (with filters) and map ORM rows to the API shape."""
    rows = await listings_repo.get_listings(
        session,
        limit=limit,
        offset=offset,
        type=type,
        house_type=house_type,
        user_id=user_id,
        city=city,
    )
    return [ListingRead.model_validate(row) for row in rows]


async def get_listing(session: AsyncSession, listing_id: int) -> ListingRead | None:
    row = await listings_repo.get_listing_by_id(session, listing_id)
    if row is None:
        return None
    return ListingRead.model_validate(row)


async def create_listing(session: AsyncSession, payload: ListingCreate) -> ListingRead:
    listing = await listings_repo.create_listing(session, payload.model_dump())
    await session.commit()  # writes are only durable once committed
    return ListingRead.model_validate(listing)


async def update_listing(
    session: AsyncSession, listing_id: int, payload: ListingUpdate
) -> ListingRead | None:
    # exclude_unset → only the fields the client actually sent get updated.
    listing = await listings_repo.update_listing(
        session, listing_id, payload.model_dump(exclude_unset=True)
    )
    if listing is None:
        return None
    await session.commit()
    return ListingRead.model_validate(listing)


async def delete_listing(session: AsyncSession, listing_id: int) -> bool:
    deleted = await listings_repo.delete_listing(session, listing_id)
    if deleted:
        await session.commit()
    return deleted
