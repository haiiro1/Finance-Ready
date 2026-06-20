from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.database.models import PasswordRecoveryCode, User
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import hash_password, hash_recovery_code


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


@pytest.fixture(name="active_user")
def active_user_fixture(session: Session):
    user = User(
        email="recovery@example.com",
        hashed_password=hash_password("OldPass123"),
        is_active=True,
        email_verified=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


_REQUEST_URL = "/api/v1/auth/password-recovery/request"
_CONFIRM_URL = "/api/v1/auth/password-recovery/confirm"
_LOGIN_URL = "/api/v1/auth/login"


def test_recovery_request_existing_email_returns_200(client, active_user):
    response = client.post(_REQUEST_URL, json={"email": "recovery@example.com"})
    assert response.status_code == 200


def test_recovery_request_unknown_email_returns_200(client):
    response = client.post(_REQUEST_URL, json={"email": "nobody@example.com"})
    assert response.status_code == 200


def test_recovery_request_does_not_reveal_email_existence(client, active_user):
    r_existing = client.post(_REQUEST_URL, json={"email": "recovery@example.com"})
    r_missing = client.post(_REQUEST_URL, json={"email": "nobody@example.com"})
    assert r_existing.json()["message"] == r_missing.json()["message"]


def test_recovery_request_persists_code_as_hash(client, active_user, session):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]
    record = session.exec(
        select(PasswordRecoveryCode).where(
            PasswordRecoveryCode.user_id == active_user.id
        )
    ).first()
    assert record is not None
    assert record.code_hash != plain_code
    assert record.code_hash == hash_recovery_code(plain_code)


def test_recovery_request_code_has_expires_at(client, active_user, session):
    client.post(_REQUEST_URL, json={"email": "recovery@example.com"})
    record = session.exec(
        select(PasswordRecoveryCode).where(
            PasswordRecoveryCode.user_id == active_user.id
        )
    ).first()
    assert record.expires_at is not None


def test_recovery_confirm_updates_password(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]

    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    assert response.status_code == 200


def test_user_can_login_with_new_password(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]
    client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    response = client.post(
        _LOGIN_URL, json={"email": "recovery@example.com", "password": "NewPass456"}
    )
    assert response.status_code == 200


def test_user_cannot_login_with_old_password(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]
    client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    response = client.post(
        _LOGIN_URL, json={"email": "recovery@example.com", "password": "OldPass123"}
    )
    assert response.status_code == 401


def test_used_code_cannot_be_reused(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]
    client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "AnotherPass789",
            "new_password_confirmation": "AnotherPass789",
        },
    )
    assert response.status_code == 400


def test_expired_code_returns_400(client, active_user, session):
    past = datetime.now(timezone.utc) - timedelta(minutes=1)
    record = PasswordRecoveryCode(
        user_id=active_user.id,
        code_hash=hash_recovery_code("000000"),
        expires_at=past,
    )
    session.add(record)
    session.commit()

    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": "000000",
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    assert response.status_code == 400


def test_invalid_code_returns_400(client, active_user):
    client.post(_REQUEST_URL, json={"email": "recovery@example.com"})
    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": "999999",
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    assert response.status_code == 400


def test_valid_code_wrong_email_returns_400(client, session):
    user1 = User(
        email="user1@example.com",
        hashed_password=hash_password("Pass1234"),
        is_active=True,
        email_verified=True,
    )
    user2 = User(
        email="user2@example.com",
        hashed_password=hash_password("Pass1234"),
        is_active=True,
        email_verified=True,
    )
    session.add(user1)
    session.add(user2)
    session.commit()

    plain_code = client.post(
        _REQUEST_URL, json={"email": "user1@example.com"}
    ).json()["recovery_code"]

    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "user2@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "NewPass456",
        },
    )
    assert response.status_code == 400


def test_weak_new_password_returns_422(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]

    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "weakpass",
            "new_password_confirmation": "weakpass",
        },
    )
    assert response.status_code == 422


def test_password_confirmation_mismatch_returns_422(client, active_user):
    plain_code = client.post(
        _REQUEST_URL, json={"email": "recovery@example.com"}
    ).json()["recovery_code"]

    response = client.post(
        _CONFIRM_URL,
        json={
            "email": "recovery@example.com",
            "code": plain_code,
            "new_password": "NewPass456",
            "new_password_confirmation": "Different789",
        },
    )
    assert response.status_code == 422


def test_inactive_user_gets_no_useful_code(client, session):
    inactive = User(
        email="inactive@example.com",
        hashed_password=hash_password("OldPass123"),
        is_active=False,
    )
    session.add(inactive)
    session.commit()
    session.refresh(inactive)

    response = client.post(_REQUEST_URL, json={"email": "inactive@example.com"})
    assert response.status_code == 200

    record = session.exec(
        select(PasswordRecoveryCode).where(
            PasswordRecoveryCode.user_id == inactive.id
        )
    ).first()
    assert record is None
