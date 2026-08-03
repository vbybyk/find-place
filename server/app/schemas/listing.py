from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ListingRead(BaseModel):
    """What the API returns for a listing.

    `from_attributes=True` lets Pydantic build this straight from an ORM
    object by reading its attributes (columns *and* @property values like
    latitude/longitude) — the equivalent of a DTO mapped from an entity.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    price: float | None = None

    type: int
    house_type: int

    country: str | None = None
    city_id: int | None = None
    city_label: str | None = None
    admin_name1: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    rooms_number: int | None = None
    floors_number: int | None = None
    floor: int | None = None
    area_total: float | None = None

    images: list[str] | None = None

    created_at: datetime


class ListingCreate(BaseModel):
    """Request body for POST /listings. lat/lng become the PostGIS point."""

    user_id: int
    title: str
    description: str
    type: int
    house_type: int

    price: float | None = None
    country: str | None = None
    city_id: int | None = None
    city_label: str | None = None
    admin_name1: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rooms_number: int | None = None
    floors_number: int | None = None
    floor: int | None = None
    area_total: float | None = None
    images: list[str] | None = None


class ListingUpdate(BaseModel):
    """Request body for PATCH /listings/{id}.

    Every field is optional — only the keys actually sent are applied
    (partial update). Pydantic's `exclude_unset` in the service is what
    tells "not sent" apart from "sent as null".
    """

    title: str | None = None
    description: str | None = None
    type: int | None = None
    house_type: int | None = None
    price: float | None = None
    country: str | None = None
    city_id: int | None = None
    city_label: str | None = None
    admin_name1: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rooms_number: int | None = None
    floors_number: int | None = None
    floor: int | None = None
    area_total: float | None = None
    images: list[str] | None = None
