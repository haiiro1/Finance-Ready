import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database.models import User
from app.database.session import get_session
from app.main import app
from app.modules.auth.security import create_access_token
from app.modules.transactions.models import FinancialCategory  # noqa: F401 — populates metadata

_BASE = "/api/v1/transactions/categories"
_EXPENSE_PAYLOAD = {"name": "Cat", "type": "expense", "color_token": "sky"}


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


def _make_user(session: Session, email: str, verified: bool = True) -> tuple[User, str]:
    from datetime import datetime, timezone

    from app.modules.auth.security import hash_password

    user = User(
        email=email,
        hashed_password=hash_password("Password123"),
        is_active=True,
        email_verified=verified,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_access_token(str(user.id))
    return user, token


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create(client, token: str, payload: dict | None = None):
    p = payload or _EXPENSE_PAYLOAD
    return client.post(_BASE, json=p, headers=_auth(token))


def _create_id(client, token: str, payload: dict | None = None) -> int:
    return _create(client, token, payload).json()["id"]


# ── Auth guards ──────────────────────────────────────────────────────────────

def test_create_requires_auth(client):
    r = client.post(_BASE, json=_EXPENSE_PAYLOAD)
    assert r.status_code == 401


def test_list_requires_auth(client):
    r = client.get(_BASE)
    assert r.status_code == 401


def test_unverified_user_gets_403(client, session):
    _, token = _make_user(session, "unverified@example.com", verified=False)
    r = client.get(_BASE, headers=_auth(token))
    assert r.status_code == 403


# ── Create ───────────────────────────────────────────────────────────────────

def test_create_expense_returns_201(client, session):
    _, token = _make_user(session, "a@example.com")
    r = _create(client, token, {"name": "Alimentación", "type": "expense", "color_token": "orange"})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Alimentación"
    assert data["type"] == "expense"
    assert data["color_token"] == "orange"
    assert data["deleted_at"] is None


def test_create_income_returns_201(client, session):
    _, token = _make_user(session, "b@example.com")
    r = _create(client, token, {"name": "Sueldo", "type": "income", "color_token": "teal"})
    assert r.status_code == 201
    assert r.json()["type"] == "income"


def test_create_invalid_type_returns_422(client, session):
    _, token = _make_user(session, "c@example.com")
    r = _create(client, token, {"name": "X", "type": "invalid", "color_token": "sky"})
    assert r.status_code == 422


def test_create_invalid_color_returns_422(client, session):
    _, token = _make_user(session, "d@example.com")
    r = _create(client, token, {"name": "X", "type": "expense", "color_token": "bg-sky-400"})
    assert r.status_code == 422


def test_create_empty_name_returns_422(client, session):
    _, token = _make_user(session, "e@example.com")
    r = _create(client, token, {"name": "   ", "type": "expense", "color_token": "sky"})
    assert r.status_code == 422


def test_name_trimmed_on_create(client, session):
    _, token = _make_user(session, "f@example.com")
    r = _create(client, token, {"name": "  Comida  ", "type": "expense", "color_token": "amber"})
    assert r.status_code == 201
    assert r.json()["name"] == "Comida"


# ── Duplicate detection ──────────────────────────────────────────────────────

def test_duplicate_name_same_type_returns_409(client, session):
    _, token = _make_user(session, "g@example.com")
    payload = {"name": "Comida", "type": "expense", "color_token": "sky"}
    _create(client, token, payload)
    r = _create(client, token, payload)
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "category_name_conflict"


def test_duplicate_case_insensitive_returns_409(client, session):
    _, token = _make_user(session, "h@example.com")
    _create(client, token, {"name": "comida", "type": "expense", "color_token": "sky"})
    r = _create(client, token, {"name": "COMIDA", "type": "expense", "color_token": "sky"})
    assert r.status_code == 409


def test_duplicate_extra_spaces_returns_409(client, session):
    _, token = _make_user(session, "i@example.com")
    _create(client, token, {"name": "mi cat", "type": "expense", "color_token": "sky"})
    r = _create(client, token, {"name": "mi  cat", "type": "expense", "color_token": "sky"})
    assert r.status_code == 409


def test_same_name_different_type_allowed(client, session):
    _, token = _make_user(session, "j@example.com")
    _create(client, token, {"name": "Varios", "type": "expense", "color_token": "sky"})
    r = _create(client, token, {"name": "Varios", "type": "income", "color_token": "teal"})
    assert r.status_code == 201


def test_same_name_different_users_allowed(client, session):
    _, token_a = _make_user(session, "k1@example.com")
    _, token_b = _make_user(session, "k2@example.com")
    _create(client, token_a)
    r = _create(client, token_b)
    assert r.status_code == 201


# ── List ─────────────────────────────────────────────────────────────────────

def test_list_isolated_by_user(client, session):
    _, token_a = _make_user(session, "l1@example.com")
    _, token_b = _make_user(session, "l2@example.com")
    _create(client, token_a, {"name": "Cat A", "type": "expense", "color_token": "sky"})
    r = client.get(_BASE, headers=_auth(token_b))
    assert r.json()["items"] == []


def test_list_filter_by_type(client, session):
    _, token = _make_user(session, "m@example.com")
    _create(client, token, {"name": "Cat1", "type": "expense", "color_token": "sky"})
    _create(client, token, {"name": "Cat2", "type": "income", "color_token": "teal"})
    r = client.get(f"{_BASE}?type=income", headers=_auth(token))
    items = r.json()["items"]
    assert len(items) == 1
    assert items[0]["type"] == "income"


def test_list_excludes_deleted_by_default(client, session):
    _, token = _make_user(session, "n@example.com")
    cid = _create_id(client, token)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    r = client.get(_BASE, headers=_auth(token))
    assert r.json()["items"] == []


def test_list_include_deleted(client, session):
    _, token = _make_user(session, "o@example.com")
    cid = _create_id(client, token)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    r = client.get(f"{_BASE}?include_deleted=true", headers=_auth(token))
    items = r.json()["items"]
    assert len(items) == 1
    assert items[0]["deleted_at"] is not None


def test_list_cursor_pagination(client, session):
    _, token = _make_user(session, "p@example.com")
    for i in range(5):
        _create(client, token, {"name": f"Cat{i:02d}", "type": "expense", "color_token": "sky"})
    r1 = client.get(f"{_BASE}?limit=3", headers=_auth(token))
    data1 = r1.json()
    assert data1["has_more"] is True
    assert len(data1["items"]) == 3
    cursor = data1["next_cursor"]
    r2 = client.get(f"{_BASE}?limit=3&cursor={cursor}", headers=_auth(token))
    data2 = r2.json()
    assert len(data2["items"]) == 2
    assert data2["has_more"] is False
    ids1 = {i["id"] for i in data1["items"]}
    ids2 = {i["id"] for i in data2["items"]}
    assert ids1.isdisjoint(ids2)


def test_list_limit_max_100(client, session):
    _, token = _make_user(session, "q@example.com")
    r = client.get(f"{_BASE}?limit=200", headers=_auth(token))
    assert r.status_code == 422


# ── Detail ───────────────────────────────────────────────────────────────────

def test_get_own_category(client, session):
    _, token = _make_user(session, "r@example.com")
    cid = _create_id(client, token)
    r = client.get(f"{_BASE}/{cid}", headers=_auth(token))
    assert r.status_code == 200
    assert r.json()["id"] == cid


def test_get_other_users_category_returns_404(client, session):
    _, token_a = _make_user(session, "s1@example.com")
    _, token_b = _make_user(session, "s2@example.com")
    cid = _create_id(client, token_a)
    r = client.get(f"{_BASE}/{cid}", headers=_auth(token_b))
    assert r.status_code == 404


# ── Update ───────────────────────────────────────────────────────────────────

def test_update_name_and_color(client, session):
    _, token = _make_user(session, "t@example.com")
    cid = _create_id(client, token, {"name": "Old", "type": "expense", "color_token": "sky"})
    r = client.patch(
        f"{_BASE}/{cid}", json={"name": "New", "color_token": "rose"}, headers=_auth(token)
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "New"
    assert data["color_token"] == "rose"


def test_type_cannot_be_changed_via_patch(client, session):
    _, token = _make_user(session, "u@example.com")
    cid = _create_id(client, token)
    r = client.patch(f"{_BASE}/{cid}", json={"color_token": "rose"}, headers=_auth(token))
    assert r.status_code == 200
    assert r.json()["type"] == "expense"


def test_update_empty_body_returns_422(client, session):
    _, token = _make_user(session, "v@example.com")
    cid = _create_id(client, token)
    r = client.patch(f"{_BASE}/{cid}", json={}, headers=_auth(token))
    assert r.status_code == 422


def test_update_other_users_category_returns_404(client, session):
    _, token_a = _make_user(session, "w1@example.com")
    _, token_b = _make_user(session, "w2@example.com")
    cid = _create_id(client, token_a)
    r = client.patch(f"{_BASE}/{cid}", json={"color_token": "rose"}, headers=_auth(token_b))
    assert r.status_code == 404


# ── Delete ───────────────────────────────────────────────────────────────────

def test_delete_returns_204(client, session):
    _, token = _make_user(session, "x@example.com")
    cid = _create_id(client, token)
    r = client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    assert r.status_code == 204


def test_delete_sets_deleted_at(client, session):
    _, token = _make_user(session, "y@example.com")
    cid = _create_id(client, token)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    r = client.get(f"{_BASE}?include_deleted=true", headers=_auth(token))
    assert r.json()["items"][0]["deleted_at"] is not None


def test_double_delete_returns_404(client, session):
    _, token = _make_user(session, "z@example.com")
    cid = _create_id(client, token)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    r = client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    assert r.status_code == 404


def test_delete_other_users_category_returns_404(client, session):
    _, token_a = _make_user(session, "aa1@example.com")
    _, token_b = _make_user(session, "aa2@example.com")
    cid = _create_id(client, token_a)
    r = client.delete(f"{_BASE}/{cid}", headers=_auth(token_b))
    assert r.status_code == 404


# ── Restore ──────────────────────────────────────────────────────────────────

def test_restore_deleted_category(client, session):
    _, token = _make_user(session, "bb@example.com")
    cid = _create_id(client, token)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token))
    r = client.post(f"{_BASE}/{cid}/restore", headers=_auth(token))
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == cid
    assert data["deleted_at"] is None


def test_restore_active_category_returns_409(client, session):
    _, token = _make_user(session, "cc@example.com")
    cid = _create_id(client, token)
    r = client.post(f"{_BASE}/{cid}/restore", headers=_auth(token))
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "category_not_deleted"


def test_restore_other_users_category_returns_404(client, session):
    _, token_a = _make_user(session, "dd1@example.com")
    _, token_b = _make_user(session, "dd2@example.com")
    cid = _create_id(client, token_a)
    client.delete(f"{_BASE}/{cid}", headers=_auth(token_a))
    r = client.post(f"{_BASE}/{cid}/restore", headers=_auth(token_b))
    assert r.status_code == 404


# ── extra=forbid (Fix 1) ─────────────────────────────────────────────────────

def test_create_rejects_user_id_in_body(client, session):
    _, token = _make_user(session, "ee@example.com")
    r = client.post(
        _BASE,
        json={"name": "Cat", "type": "expense", "color_token": "sky", "user_id": 99},
        headers=_auth(token),
    )
    assert r.status_code == 422


def test_patch_rejects_type_in_body(client, session):
    _, token = _make_user(session, "ff@example.com")
    cid = _create_id(client, token)
    r = client.patch(
        f"{_BASE}/{cid}",
        json={"color_token": "rose", "type": "income"},
        headers=_auth(token),
    )
    assert r.status_code == 422


def test_patch_rejects_user_id_in_body(client, session):
    _, token = _make_user(session, "gg@example.com")
    cid = _create_id(client, token)
    r = client.patch(
        f"{_BASE}/{cid}",
        json={"color_token": "rose", "user_id": 99},
        headers=_auth(token),
    )
    assert r.status_code == 422


# ── Invalid cursor (Fix 2) ───────────────────────────────────────────────────

def test_invalid_cursor_returns_422(client, session):
    _, token = _make_user(session, "hh@example.com")
    r = client.get(f"{_BASE}?cursor=not-a-valid-cursor", headers=_auth(token))
    assert r.status_code == 422
    assert r.json()["detail"]["code"] == "invalid_cursor"


def test_cursor_with_changed_type_filter_returns_422(client, session):
    _, token = _make_user(session, "ii@example.com")
    for i in range(4):
        _create(client, token, {"name": f"E{i}", "type": "expense", "color_token": "sky"})
    r1 = client.get(f"{_BASE}?type=expense&limit=2", headers=_auth(token))
    cursor = r1.json()["next_cursor"]
    r2 = client.get(f"{_BASE}?type=income&limit=2&cursor={cursor}", headers=_auth(token))
    assert r2.status_code == 422
    assert r2.json()["detail"]["code"] == "invalid_cursor"


def test_cursor_cross_user_returns_422(client, session):
    _, token_a = _make_user(session, "kk1@example.com")
    _, token_b = _make_user(session, "kk2@example.com")
    for i in range(3):
        _create(client, token_a, {"name": f"ACat{i}", "type": "expense", "color_token": "sky"})
    r = client.get(f"{_BASE}?limit=2", headers=_auth(token_a))
    cursor = r.json()["next_cursor"]
    r2 = client.get(f"{_BASE}?limit=2&cursor={cursor}", headers=_auth(token_b))
    assert r2.status_code == 422
    assert r2.json()["detail"]["code"] == "invalid_cursor"


# ── Unicode NFKC normalization (Fix 3) ───────────────────────────────────────

def test_nfkc_duplicate_composed_decomposed(client, session):
    _, token = _make_user(session, "jj@example.com")
    # "café" with precomposed é (U+00E9)
    composed = "café"
    # "café" with decomposed e + combining acute (U+0301)
    decomposed = "café"
    _create(client, token, {"name": composed, "type": "expense", "color_token": "sky"})
    r = _create(client, token, {"name": decomposed, "type": "expense", "color_token": "sky"})
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "category_name_conflict"
