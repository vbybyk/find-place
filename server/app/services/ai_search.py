from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import listings as listings_repo
from app.schemas.ai_search import AISearchCriteria, AISearchResponse
from app.schemas.listing import ListingRead
from app.services import gemini_client, geocoding_client

DEFAULT_RADIUS_KM = 5.0
RESULT_LIMIT = 12


async def search(session: AsyncSession, message: str) -> AISearchResponse:
    """Turn a free-text chat message into matching listings.

    One-shot: no conversation history is kept or sent to Gemini. Any failure
    along the way (Gemini, geocoding) degrades to a smaller/broader result
    rather than an error response.
    """
    criteria = await gemini_client.extract_criteria(message)
    if criteria is None:
        return AISearchResponse(
            reply="Sorry, I couldn't understand that — could you try rephrasing?",
            criteria=AISearchCriteria(),
            listings=[],
        )

    lat: float | None = None
    lng: float | None = None
    unresolved_location: str | None = None
    if criteria.location_text:
        coords = await geocoding_client.geocode(criteria.location_text)
        if coords is not None:
            lat, lng = coords
        else:
            unresolved_location = criteria.location_text

    radius_km = criteria.radius_km
    if lat is not None and radius_km is None:
        radius_km = DEFAULT_RADIUS_KM

    rows = await listings_repo.get_listings(
        session,
        limit=RESULT_LIMIT,
        type=criteria.type,
        house_type=criteria.house_type,
        min_price=criteria.min_price,
        max_price=criteria.max_price,
        min_rooms=criteria.min_rooms,
        min_bathrooms=criteria.min_bathrooms,
        min_parking=criteria.min_parking,
        furnished=criteria.furnished,
        amenities=criteria.amenities,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
    )
    listings = [ListingRead.model_validate(row) for row in rows]

    reply = _build_reply(criteria, listings, unresolved_location)
    return AISearchResponse(reply=reply, criteria=criteria, listings=listings)


def _build_reply(
    criteria: AISearchCriteria, listings: list[ListingRead], unresolved_location: str | None
) -> str:
    """A short templated summary — no second Gemini call for this in v1."""
    count = len(listings)
    if count == 0:
        reply = "I couldn't find any listings matching that — try loosening a filter?"
    else:
        kind = {1: "rental", 2: "property"}.get(criteria.type, "listing")
        reply = f"Found {count} {kind}{'s' if count != 1 else ''}"
        if criteria.location_text:
            reply += f" near {criteria.location_text}"
        reply += "."

    if unresolved_location:
        reply += f' (Couldn\'t pinpoint "{unresolved_location}" on the map, so results aren\'t limited by distance.)'
    return reply
