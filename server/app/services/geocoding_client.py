import httpx

from app.config import settings

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


async def geocode(location_text: str) -> tuple[float, float] | None:
    """Resolve a free-text place name (e.g. "BGC, Taguig") to (lat, lng) via
    Google's Geocoding API.

    Returns None on any failure — missing key, network error, or no match —
    so callers can treat that as "skip radius search" rather than an error.
    """
    if not settings.google_geocoding_api_key:
        return None

    params = {
        "address": location_text,
        "region": "ph",
        "key": settings.google_geocoding_api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(GEOCODE_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError:
        return None

    results = data.get("results") or []
    if not results:
        return None

    location = results[0]["geometry"]["location"]
    return location["lat"], location["lng"]
