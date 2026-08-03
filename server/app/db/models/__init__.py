"""ORM models. Importing this package registers every table on Base.metadata."""

from app.db.models.listing import Listing

__all__ = ["Listing"]
