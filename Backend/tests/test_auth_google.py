"""Tests for Google OAuth login (HU-0302).

The Google token verifier is mocked at the service boundary so tests do not
make any network calls to Google.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.google_identity import GoogleIdentityClaims
from app.database.models import User, UserIdentity
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import hash_password

_GOOGLE_ENDPOINT = "/api/v1/auth/google"
_VALID_CREDENTIAL = "google-id-token-placeholder"

_VALID_CLAIMS = GoogleIdentityClaims(
    sub="google-sub-12345",
    email="google@example.com",
    email_verified=True,
    name="Google User",
)


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
    def override():
        return session

    app.dependency_overrides[get_session] = override
    yield TestClient(app)
    app.dependency_overrides.clear()


def _patch_verify(claims=_VALID_CLAIMS):
    return patch(
        "app.modules.auth.service.verify_google_id_token",
        return_value=claims,
    )


def _patch_unavailable():
    from app.core.google_identity import GoogleAuthUnavailable

    return patch(
        "app.modules.auth.service.verify_google_id_token",
        side_effect=GoogleAuthUnavailable("no client id"),
    )


def _patch_invalid_token(msg="bad token"):
    from app.core.google_identity import GoogleTokenError

    return patch(
        "app.modules.auth.service.verify_google_id_token",
        side_effect=GoogleTokenError(msg),
    )


# ── Happy paths ───────────────────────────────────────────────────────────────


def test_google_login_creates_new_user(client, session):
    with _patch_verify():
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "google@example.com"

    user = session.exec(
        __import__("sqlmodel").select(User).where(User.email == "google@example.com")
    ).first()
    assert user is not None
    assert user.hashed_password is None
    assert user.email_verified is True
    assert user.is_active is True


def test_google_login_new_user_has_null_password_and_verified_email(client, session):
    with _patch_verify():
        client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    from sqlmodel import select

    user = session.exec(select(User).where(User.email == "google@example.com")).first()
    assert user.hashed_password is None
    assert user.email_verified is True


def test_google_login_creates_identity_record(client, session):
    with _patch_verify():
        client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    from sqlmodel import select

    identity = session.exec(
        select(UserIdentity).where(
            UserIdentity.provider == "google",
            UserIdentity.provider_subject == "google-sub-12345",
        )
    ).first()
    assert identity is not None
    assert identity.provider_email == "google@example.com"


def test_google_second_login_reuses_existing_user(client, session):
    with _patch_verify():
        r1 = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})
        r2 = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert r1.status_code == 200
    assert r2.status_code == 200

    from sqlmodel import select

    users = session.exec(select(User).where(User.email == "google@example.com")).all()
    assert len(users) == 1


def test_google_second_login_returns_auth_response(client, session):
    with _patch_verify():
        client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})
        r2 = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    data = r2.json()
    assert "access_token" in data
    assert data["user"]["email"] == "google@example.com"


# ── Error: inactive user ───────────────────────────────────────────────────────


def test_google_login_inactive_user_returns_403(client, session):
    from sqlmodel import select

    with _patch_verify():
        client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    user = session.exec(select(User).where(User.email == "google@example.com")).first()
    user.is_active = False
    session.add(user)
    session.commit()

    with _patch_verify():
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "inactive_user"


# ── Error: email collision with local account ─────────────────────────────────


def test_google_login_local_email_collision_returns_409(client, session):
    local_user = User(
        email="google@example.com",
        hashed_password=hash_password("StrongPass123"),
        email_verified=True,
    )
    session.add(local_user)
    session.commit()

    with _patch_verify():
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "google_link_required"


def test_google_login_409_does_not_create_identity(client, session):
    local_user = User(
        email="google@example.com",
        hashed_password=hash_password("StrongPass123"),
        email_verified=True,
    )
    session.add(local_user)
    session.commit()

    with _patch_verify():
        client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    from sqlmodel import select

    identities = session.exec(select(UserIdentity)).all()
    assert len(identities) == 0


# ── Error: invalid / expired / bad token ─────────────────────────────────────


def test_google_invalid_token_returns_400(client):
    with _patch_invalid_token():
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": "bad"})

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "invalid_google_token"


def test_google_invalid_token_does_not_persist_user(client, session):
    with _patch_invalid_token():
        client.post(_GOOGLE_ENDPOINT, json={"credential": "bad"})

    from sqlmodel import select

    assert session.exec(select(User)).first() is None


def test_google_unavailable_returns_503(client):
    with _patch_unavailable():
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "google_auth_unavailable"


def test_google_email_not_verified_returns_400(client):
    from app.core.google_identity import GoogleTokenError

    with patch(
        "app.modules.auth.service.verify_google_id_token",
        side_effect=GoogleTokenError("Email not verified by Google"),
    ):
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "invalid_google_token"


def test_google_missing_sub_returns_400(client):
    from app.core.google_identity import GoogleTokenError

    with patch(
        "app.modules.auth.service.verify_google_id_token",
        side_effect=GoogleTokenError("Token missing required claims (sub, email)"),
    ):
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 400


def test_google_missing_credential_field_returns_422(client):
    response = client.post(_GOOGLE_ENDPOINT, json={})
    assert response.status_code == 422


# ── google_identity.py unit tests (mocking the underlying library) ────────────


def test_verify_passes_client_id_to_library():
    """verify_google_id_token must forward settings.google_client_id so the
    library validates the aud claim against our client ID, not an attacker's."""
    from unittest.mock import patch

    from app.core import google_identity as gi_module
    from app.core.config import settings

    fake_claims = {
        "sub": "s",
        "email": "e@example.com",
        "email_verified": True,
    }
    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims) as mock_v:
        gi_module.verify_google_id_token("tok")

    assert mock_v.call_count == 1
    _token_arg, _request_arg, audience_arg = mock_v.call_args[0]
    assert audience_arg == settings.google_client_id


def test_transport_error_raises_google_auth_unavailable():
    """Network failures during Google token verification must surface as
    GoogleAuthUnavailable, not GoogleTokenError."""
    from unittest.mock import patch

    from google.auth.exceptions import TransportError

    from app.core import google_identity as gi_module

    with patch(
        "google.oauth2.id_token.verify_oauth2_token",
        side_effect=TransportError("connection refused"),
    ):
        with pytest.raises(gi_module.GoogleAuthUnavailable):
            gi_module.verify_google_id_token("tok")


def test_transport_error_returns_503_at_endpoint(client):
    """End-to-end: a network failure reaching Google must return 503, not 400."""
    from app.core.google_identity import GoogleAuthUnavailable

    with patch(
        "app.modules.auth.service.verify_google_id_token",
        side_effect=GoogleAuthUnavailable("network down"),
    ):
        response = client.post(_GOOGLE_ENDPOINT, json={"credential": _VALID_CREDENTIAL})

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "google_auth_unavailable"


# ── Local login regression ────────────────────────────────────────────────────


def test_local_login_still_works_after_google_changes(client, session):
    user = User(
        email="local@example.com",
        hashed_password=hash_password("StrongPass123"),
        email_verified=True,
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/v1/auth/login", json={"email": "local@example.com", "password": "StrongPass123"}
    )
    assert response.status_code == 200


def test_local_login_with_null_password_returns_401(client, session):
    user = User(
        email="google-only@example.com",
        hashed_password=None,
        email_verified=True,
        is_active=True,
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "google-only@example.com", "password": "AnyPassword1"},
    )
    assert response.status_code == 401
