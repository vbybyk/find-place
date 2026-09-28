from google import genai
from google.genai import types

from app.config import settings
from app.schemas.ai_search import AISearchCriteria

_SYSTEM_PROMPT = """
You extract structured property-search filters from a user's natural-language
message for a Philippines property-listings site. Only fill in fields the
user actually implied; leave everything else null — never guess.

Domain encoding:
- type: 1 = Rent, 2 = Sale
- house_type: 1 = Apartment, 2 = House
- furnished: 1 = Unfurnished, 2 = Semi-furnished, 3 = Furnished

location_text should be a short place name suitable for geocoding (a city,
neighborhood, or landmark) — not a full sentence.
""".strip()


async def extract_criteria(message: str) -> AISearchCriteria | None:
    """Ask Gemini to turn a free-text `message` into structured search filters.

    Returns None on any failure (missing key, API error, bad response) so the
    caller can degrade gracefully instead of the whole request failing.
    """
    if not settings.gemini_api_key:
        return None

    client = genai.Client(api_key=settings.gemini_api_key)
    try:
        response = await client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AISearchCriteria,
            ),
        )
    except Exception:
        return None

    return response.parsed if isinstance(response.parsed, AISearchCriteria) else None
