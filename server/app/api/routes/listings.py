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
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    min_rooms: int | None = Query(None, ge=0, description="Minimum bedrooms"),
    min_bathrooms: int | None = Query(None, ge=0),
    min_parking: int | None = Query(None, ge=0),
    furnished: int | None = Query(None, description="1=Unfurnished, 2=Semi, 3=Furnished"),
    amenities: list[str] | None = Query(None, description="Match any of these amenity keys"),
    lat: float | None = Query(None, description="Search origin latitude (needs lng + radius_km)"),
    lng: float | None = Query(None, description="Search origin longitude (needs lat + radius_km)"),
    radius_km: float | None = Query(None, gt=0, description="Radius around lat/lng, in km"),
) -> list[ListingRead]:
    return await listings_service.list_listings(
        session,
        limit=limit,
        offset=offset,
        type=type,
        house_type=house_type,
        user_id=user_id,
        city=city,
        min_price=min_price,
        max_price=max_price,
        min_rooms=min_rooms,
        min_bathrooms=min_bathrooms,
        min_parking=min_parking,
        furnished=furnished,
        amenities=amenities,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
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
