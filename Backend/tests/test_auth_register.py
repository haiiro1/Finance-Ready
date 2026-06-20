import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.core.config import settings
from app.database.models import User
from app.database.session import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()


_VALID_PAYLOAD = {"email": "user@example.com", "password": "StrongPass123"}


def test_register_returns_201(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    assert response.status_code == 201


def test_register_returns_access_token(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    data = response.json()
    assert "access_token" in data
    assert data["access_token"]


def test_register_token_type_is_bearer(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    assert response.json()["token_type"] == "bearer"


def test_register_persists_user(client, session):
    client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    user = session.exec(select(User).where(User.email == "user@example.com")).first()
    assert user is not None
    assert user.is_active is True


def test_register_password_is_hashed(client, session):
    client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    user = session.exec(select(User).where(User.email == "user@example.com")).first()
    assert user.hashed_password != "StrongPass123"


def test_register_does_not_expose_hashed_password(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    assert "hashed_password" not in response.text
    assert "password" not in response.text


def test_register_duplicate_email_returns_409(client):
    client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    assert response.status_code == 409


def test_register_invalid_email_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "StrongPass123"},
    )
    assert response.status_code == 422


def test_register_short_password_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "Ab1"},
    )
    assert response.status_code == 422


def test_register_password_without_number_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "NoNumbersHere"},
    )
    assert response.status_code == 422


def test_register_password_without_letter_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "12345678"},
    )
    assert response.status_code == 422


def test_register_jwt_has_sub_and_exp(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    token = response.json()["access_token"]
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    assert "sub" in payload
    assert "exp" in payload


def test_register_with_full_name(client):
    response = client.post(
        "/api/v1/auth/register",
        json={**_VALID_PAYLOAD, "full_name": "Test User"},
    )
    assert response.status_code == 201
    assert response.json()["user"]["full_name"] == "Test User"


def test_register_email_is_lowercased(client, session):
    client.post(
        "/api/v1/auth/register",
        json={"email": "USER@EXAMPLE.COM", "password": "StrongPass123"},
    )
    user = session.exec(select(User).where(User.email == "user@example.com")).first()
    assert user is not None


def test_register_user_response_has_expected_fields(client):
    response = client.post("/api/v1/auth/register", json=_VALID_PAYLOAD)
    user = response.json()["user"]
    assert "id" in user
    assert "email" in user
    assert "is_active" in user
    assert user["is_active"] is True
