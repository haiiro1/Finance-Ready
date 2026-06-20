from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import settings
from app.database.models import GmailCredential, User
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import create_access_token, hash_password

_AUTH_URL = "/api/v1/gmail/auth"
_STATUS_URL = "/api/v1/gmail/status"
_DISCONNECT_URL = "/api/v1/gmail/disconnect"
_CALLBACK_URL = "/api/v1/gmail/callback"

_ADMIN_TOKEN = "test-admin-setup-token"


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
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app, follow_redirects=False)
    app.dependency_overrides.clear()


@pytest.fixture(name="verified_user")
def verified_user_fixture(session: Session):
    user = User(
        email="admin@example.com",
        hashed_password=hash_password("StrongPass123"),
        email_verified=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(verified_user: User):
    token = create_access_token(subject=verified_user.id)
    return {"Authorization": f"Bearer {token}"}


# ── /gmail/auth ────────────────────────────────────────────────────────────────

_FAKE_AUTH_URL = ("https://accounts.google.com/auth?foo=bar", "state123")


def test_gmail_auth_with_valid_jwt_returns_auth_url(client, auth_headers):
    with patch("app.core.gmail.build_authorization_url", return_value=_FAKE_AUTH_URL):
        response = client.get(_AUTH_URL, headers=auth_headers)
    assert response.status_code == 200
    assert "auth_url" in response.json()


def test_gmail_auth_with_admin_token_returns_auth_url(client):
    with (
        patch.object(settings, "admin_setup_token", _ADMIN_TOKEN),
        patch("app.core.gmail.build_authorization_url", return_value=_FAKE_AUTH_URL),
    ):
        response = client.get(_AUTH_URL, headers={"X-Admin-Setup-Token": _ADMIN_TOKEN})
    assert response.status_code == 200
    assert "auth_url" in response.json()


def test_gmail_auth_without_credentials_returns_401(client):
    response = client.get(_AUTH_URL)
    assert response.status_code == 401
    assert "ADMIN_SETUP_TOKEN" in response.json()["detail"]


def test_gmail_auth_with_invalid_bearer_returns_401_with_token_message(client):
    response = client.get(_AUTH_URL, headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401
    assert "Token invalido" in response.json()["detail"]


def test_gmail_auth_with_wrong_admin_token_returns_401(client):
    with patch.object(settings, "admin_setup_token", _ADMIN_TOKEN):
        response = client.get(_AUTH_URL, headers={"X-Admin-Setup-Token": "wrong-token"})
    assert response.status_code == 401


def test_gmail_auth_with_empty_admin_setup_token_setting_blocks_header(client):
    with patch.object(settings, "admin_setup_token", ""):
        response = client.get(_AUTH_URL, headers={"X-Admin-Setup-Token": "anything"})
    assert response.status_code == 401


# ── /gmail/callback ────────────────────────────────────────────────────────────

_FAKE_TOKEN_JSON = (
    '{"access_token":"tok","refresh_token":"ref",'
    '"expires_at":"2099-01-01T00:00:00+00:00"}'
)


def test_callback_with_valid_state_stores_credential_and_redirects(client, session):
    with (
        patch("app.core.gmail.verify_and_consume_oauth_state", return_value=True),
        patch("app.core.gmail.exchange_code_for_token", return_value=_FAKE_TOKEN_JSON),
        patch.object(settings, "gmail_sender_email", "sender@example.com"),
    ):
        response = client.get(_CALLBACK_URL, params={"code": "authcode", "state": "validstate"})

    assert response.status_code == 302
    assert "gmail=connected" in response.headers["location"]
    credential = session.get(GmailCredential, 1)
    assert credential is not None
    assert credential.email == "sender@example.com"


def test_callback_with_invalid_state_redirects_with_error(client):
    with patch("app.core.gmail.verify_and_consume_oauth_state", return_value=False):
        response = client.get(_CALLBACK_URL, params={"code": "authcode", "state": "badstate"})

    assert response.status_code == 302
    assert "gmail=error" in response.headers["location"]
    assert "invalid_state" in response.headers["location"]


# ── /gmail/status ──────────────────────────────────────────────────────────────

def test_status_when_not_connected(client, auth_headers):
    response = client.get(_STATUS_URL, headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"connected": False, "email": None}


def test_status_when_connected(client, session, auth_headers):
    credential = GmailCredential(email="sender@example.com", token_json=_FAKE_TOKEN_JSON)
    session.add(credential)
    session.commit()

    response = client.get(_STATUS_URL, headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"connected": True, "email": "sender@example.com"}


def test_status_without_auth_returns_401(client):
    response = client.get(_STATUS_URL)
    assert response.status_code == 401


# ── /gmail/disconnect ──────────────────────────────────────────────────────────

def test_disconnect_removes_credential(client, session, auth_headers):
    credential = GmailCredential(email="sender@example.com", token_json=_FAKE_TOKEN_JSON)
    session.add(credential)
    session.commit()

    response = client.post(_DISCONNECT_URL, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["removed"] == 1
    assert session.get(GmailCredential, credential.id) is None


def test_disconnect_when_nothing_connected(client, auth_headers):
    response = client.post(_DISCONNECT_URL, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["removed"] == 0


def test_disconnect_without_auth_returns_401(client):
    response = client.post(_DISCONNECT_URL)
    assert response.status_code == 401
