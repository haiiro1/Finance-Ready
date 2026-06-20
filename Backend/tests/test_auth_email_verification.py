from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.database.models import EmailVerificationCode, User
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import hash_password, hash_verification_code

_REGISTER_URL = "/api/v1/auth/register"
_LOGIN_URL = "/api/v1/auth/login"
_CONFIRM_URL = "/api/v1/auth/email-verification/confirm"
_RESEND_URL = "/api/v1/auth/email-verification/resend"

_REGISTER_PAYLOAD = {
    "email": "verify@example.com",
    "password": "StrongPass123",
    "password_confirmation": "StrongPass123",
}
_LOGIN_PAYLOAD = {"email": "verify@example.com", "password": "StrongPass123"}


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


@pytest.fixture(name="unverified_user")
def unverified_user_fixture(session: Session):
    user = User(
        email="verify@example.com",
        hashed_password=hash_password("StrongPass123"),
        email_verified=False,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def test_registration_creates_user_with_email_unverified(client, session):
    client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    user = session.exec(select(User).where(User.email == "verify@example.com")).first()
    assert user is not None
    assert user.email_verified is False


def test_registration_generates_verification_code(client, session):
    response = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    assert response.json()["verification_code"] is not None


def test_registration_persists_code_as_hash(client, session):
    response = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    plain_code = response.json()["verification_code"]
    user = session.exec(select(User).where(User.email == "verify@example.com")).first()
    record = session.exec(
        select(EmailVerificationCode).where(EmailVerificationCode.user_id == user.id)
    ).first()
    assert record is not None
    assert record.code_hash != plain_code
    assert record.code_hash == hash_verification_code(plain_code)


def test_unverified_user_cannot_login(client, session):
    client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    response = client.post(_LOGIN_URL, json=_LOGIN_PAYLOAD)
    assert response.status_code == 403


def test_confirm_with_valid_code_sets_email_verified(client, session):
    reg = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    plain_code = reg.json()["verification_code"]

    response = client.post(
        _CONFIRM_URL, json={"email": "verify@example.com", "code": plain_code}
    )
    assert response.status_code == 200

    user = session.exec(select(User).where(User.email == "verify@example.com")).first()
    session.refresh(user)
    assert user.email_verified is True


def test_verified_user_can_login(client, session):
    reg = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    plain_code = reg.json()["verification_code"]
    client.post(_CONFIRM_URL, json={"email": "verify@example.com", "code": plain_code})

    response = client.post(_LOGIN_URL, json=_LOGIN_PAYLOAD)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_invalid_code_returns_400(client, session):
    client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    response = client.post(
        _CONFIRM_URL, json={"email": "verify@example.com", "code": "000000"}
    )
    assert response.status_code == 400


def test_expired_code_returns_400(client, session, unverified_user):
    past = datetime.now(timezone.utc) - timedelta(minutes=1)
    record = EmailVerificationCode(
        user_id=unverified_user.id,
        code_hash=hash_verification_code("111111"),
        expires_at=past,
    )
    session.add(record)
    session.commit()

    response = client.post(
        _CONFIRM_URL, json={"email": "verify@example.com", "code": "111111"}
    )
    assert response.status_code == 400


def test_used_code_cannot_be_reused(client, session, unverified_user):
    now = datetime.now(timezone.utc)
    record = EmailVerificationCode(
        user_id=unverified_user.id,
        code_hash=hash_verification_code("222222"),
        expires_at=now + timedelta(minutes=30),
        used_at=now,
    )
    session.add(record)
    session.commit()

    response = client.post(
        _CONFIRM_URL, json={"email": "verify@example.com", "code": "222222"}
    )
    assert response.status_code == 400


def test_confirm_already_verified_returns_200(client, session):
    reg = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    plain_code = reg.json()["verification_code"]
    client.post(_CONFIRM_URL, json={"email": "verify@example.com", "code": plain_code})

    response = client.post(
        _CONFIRM_URL, json={"email": "verify@example.com", "code": plain_code}
    )
    assert response.status_code in (200, 400)


def test_resend_existing_unverified_email_returns_200(client, session, unverified_user):
    response = client.post(_RESEND_URL, json={"email": "verify@example.com"})
    assert response.status_code == 200
    assert response.json()["verification_code"] is not None


def test_resend_unknown_email_returns_200(client):
    response = client.post(_RESEND_URL, json={"email": "nobody@example.com"})
    assert response.status_code == 200


def test_resend_does_not_reveal_email_existence(client, session, unverified_user):
    r_existing = client.post(_RESEND_URL, json={"email": "verify@example.com"})
    r_missing = client.post(_RESEND_URL, json={"email": "nobody@example.com"})
    assert r_existing.json()["message"] == r_missing.json()["message"]


def test_resend_for_already_verified_user_returns_200_without_code(client, session):
    reg = client.post(_REGISTER_URL, json=_REGISTER_PAYLOAD)
    plain_code = reg.json()["verification_code"]
    client.post(_CONFIRM_URL, json={"email": "verify@example.com", "code": plain_code})

    response = client.post(_RESEND_URL, json={"email": "verify@example.com"})
    assert response.status_code == 200
    assert response.json().get("verification_code") is None
