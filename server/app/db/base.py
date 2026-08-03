from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Root class every ORM model inherits from.

    SQLAlchemy collects each model's table into ``Base.metadata`` — that
    registry is what Alembic diffs against the real database to generate
    migrations.
    """
