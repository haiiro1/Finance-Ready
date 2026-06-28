from sqlmodel import Session, create_engine

from app.core.config import settings

# The engine is the entry point to the database.
# pool_pre_ping=True checks connections for liveness before handing them out.
engine = create_engine(settings.database_url, pool_pre_ping=True)


def get_session():
    """
    Dependency to get a database session.
    """
    with Session(engine) as session:
        yield session
