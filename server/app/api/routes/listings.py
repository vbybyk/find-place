from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.listing import ListingCreate, ListingRead, ListingUpdate
from app.services import listings as listings_service

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=list[ListingRead])
async def list_listings(
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=100, description="Max rows to return"),
    offset: int = Query(0, ge=0, description="Rows to skip (pagination)"),
    type: int | None = Query(None, description="1=Rent, 2=Sale"),
    house_type: int | None = Query(None, description="1=Apartment, 2=House"),
    user_id: int | None = Query(None, description="Only this owner's listings"),
    city: str | None = Query(None, description="Case-insensitive city match"),
) -> list[ListingRead]:
    return await listings_service.list_listings(
        session,
        limit=limit,
        offset=offset,
        type=type,
        house_type=house_type,
        user_id=user_id,
        city=city,
    )


@router.get("/{listing_id}", response_model=ListingRead)
async def get_listing(
    listing_id: int,
    session: AsyncSession = Depends(get_session),
) -> ListingRead:
    listing = await listings_service.get_listing(session, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.post("", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: ListingCreate,
    session: AsyncSession = Depends(get_session),
) -> ListingRead:
    return await listings_service.create_listing(session, payload)


@router.patch("/{listing_id}", response_model=ListingRead)
async def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    session: AsyncSession = Depends(get_session),
) -> ListingRead:
    listing = await listings_service.update_listing(session, listing_id, payload)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    deleted = await listings_service.delete_listing(session, listing_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Listing not found")
