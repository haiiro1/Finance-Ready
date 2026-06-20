import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import settings
from app.database.models import User
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import hash_password


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


@pytest.fixture(name="registered_user")
def registered_user_fixture(session: Session):
    user = User(
        email="login@example.com",
        hashed_password=hash_password("StrongPass123"),
        full_name="Login User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


_LOGIN_PAYLOAD = {"email": "login@example.com", "password": "StrongPass123"}


def test_login_returns_200(client, registered_user):
    response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    assert response.status_code == 200


def test_login_returns_access_token(client, registered_user):
    response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    data = response.json()
    assert "access_token" in data
    assert data["access_token"]


def test_login_token_type_is_bearer(client, registered_user):
    response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    assert response.json()["token_type"] == "bearer"


def test_login_response_contains_user(client, registered_user):
    response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "login@example.com"


def test_login_does_not_expose_password(client, registered_user):
    response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    assert "hashed_password" not in response.text
    assert "password" not in response.text


def test_login_wrong_password_returns_401(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "WrongPass999"},
    )
    assert response.status_code == 401


def test_login_unknown_email_returns_401(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "StrongPass123"},
    )
    assert response.status_code == 401


def test_login_invalid_email_returns_422(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": "StrongPass123"},
    )
    assert response.status_code == 422


def test_login_normalizes_email(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "LOGIN@EXAMPLE.COM", "password": "StrongPass123"},
    )
    assert response.status_code == 200


def test_login_inactive_user_returns_403(client, session):
    user = User(
        email="inactive@example.com",
        hashed_password=hash_password("StrongPass123"),
        is_active=False,
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@example.com", "password": "StrongPass123"},
    )
    assert response.status_code == 403


def test_me_with_valid_token_returns_user(client, registered_user):
    login_response = client.post("/api/v1/auth/login", json=_LOGIN_PAYLOAD)
    token = login_response.json()["access_token"]
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "login@example.com"


def test_me_without_token_returns_401(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token_returns_401(client):
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
    )
    assert response.status_code == 401


def test_me_with_non_numeric_sub_returns_401(client):
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {"sub": "abc", "exp": datetime.now(timezone.utc) + timedelta(minutes=30)},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
