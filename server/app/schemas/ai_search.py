from pydantic import BaseModel, Field

from app.schemas.listing import ListingRead


class AISearchCriteria(BaseModel):
    """Structured filters extracted from a free-text chat message.

    Every field is optional — Gemini only fills in what the user actually
    specified. `None` means "no opinion," not "explicitly excluded."
    """

    type: int | None = Field(None, description="1=Rent, 2=Sale")
    house_type: int | None = Field(None, description="1=Apartment, 2=House")
    location_text: str | None = Field(
        None,
        description=(
            "A place name to search near (city, neighborhood, or landmark), "
            "e.g. 'BGC, Taguig' — only set if the user mentioned a specific area."
        ),
    )
    radius_km: float | None = Field(
        None, description="Search radius in km around location_text, if implied (e.g. 'within 2km')"
    )
    min_price: float | None = None
    max_price: float | None = None
    min_rooms: int | None = Field(None, description="Minimum bedrooms")
    min_bathrooms: int | None = None
    min_parking: int | None = None
    furnished: int | None = Field(None, description="1=Unfurnished, 2=Semi-furnished, 3=Furnished")
    amenities: list[str] | None = Field(None, description="Amenities mentioned, e.g. ['pool', 'gym']")


class AISearchRequest(BaseModel):
    """Request body for POST /ai-search."""

    message: str = Field(min_length=1, max_length=500)


class AISearchResponse(BaseModel):
    """Response body for POST /ai-search."""

    reply: str
    criteria: AISearchCriteria
    listings: list[ListingRead]
