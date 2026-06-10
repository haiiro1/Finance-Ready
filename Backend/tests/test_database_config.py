def test_database_url_is_set():
    """
    Tests that the DATABASE_URL is loaded into the settings.
    """
    from app.core.config import settings

    assert settings.database_url is not None
    assert "postgresql" in settings.database_url


def test_sqlmodel_metadata_has_tables():
    """
    Tests that after importing models, SQLModel.metadata contains the tables.
    """
    from sqlmodel import SQLModel

    from app.database import models  # noqa: F401

    assert "migration_checks" in SQLModel.metadata.tables
