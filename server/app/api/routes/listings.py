from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.listing import ListingRead
from app.services import listings as listings_service

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=list[ListingRead])
async def list_listings(
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=100, description="Max rows to return"),
    offset: int = Query(0, ge=0, description="Rows to skip (pagination)"),
) -> list[ListingRead]:
    return await listings_service.list_listings(session, limit=limit, offset=offset)


@router.get("/{listing_id}", response_model=ListingRead)
async def get_listing(
    listing_id: int,
    session: AsyncSession = Depends(get_session),
) -> ListingRead:
    listing = await listings_service.get_listing(session, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing
