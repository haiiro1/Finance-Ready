import base64
import hashlib
import hmac
import json
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, and_, or_, select

from app.core.config import settings
from app.modules.transactions.models import FinancialCategory, normalize_name
from app.modules.transactions.schemas import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryType,
    CategoryUpdate,
)

_DEFAULT_LIMIT = 50
_MAX_LIMIT = 100


class CategoryConflictError(Exception):
    pass


class CategoryNotFoundError(Exception):
    pass


class CategoryNotDeletedError(Exception):
    pass


class InvalidCursorError(Exception):
    pass


def _to_response(cat: FinancialCategory) -> CategoryResponse:
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        type=cat.type,
        color_token=cat.color_token,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
        deleted_at=cat.deleted_at,
    )


def _sign(payload_json: str) -> str:
    return hmac.new(
        settings.secret_key.encode(), payload_json.encode(), hashlib.sha256
    ).hexdigest()


def _encode_cursor(
    normalized_name: str,
    record_id: int,
    type_filter: str | None,
    include_deleted: bool,
    user_id: int,
) -> str:
    payload = {
        "nn": normalized_name,
        "id": record_id,
        "tf": type_filter,
        "idel": include_deleted,
        "uid": user_id,
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode()
    return f"{payload_b64}.{_sign(payload_json)}"


def _decode_cursor(
    cursor: str,
    type_filter: str | None,
    include_deleted: bool,
    user_id: int,
) -> tuple[str, int] | None:
    try:
        parts = cursor.split(".", 1)
        if len(parts) != 2:
            return None
        payload_b64, provided_sig = parts
        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        if not hmac.compare_digest(_sign(payload_json), provided_sig):
            return None
        payload = json.loads(payload_json)
        if payload.get("tf") != type_filter:
            return None
        if payload.get("idel") != include_deleted:
            return None
        if payload.get("uid") != user_id:
            return None
        return payload["nn"], int(payload["id"])
    except Exception:
        return None


def create_category(session: Session, user_id: int, data: CategoryCreate) -> FinancialCategory:
    norm = normalize_name(data.name)
    category = FinancialCategory(
        user_id=user_id,
        name=data.name,
        normalized_name=norm,
        type=data.type.value,
        color_token=data.color_token.value,
    )
    session.add(category)
    try:
        session.commit()
        session.refresh(category)
    except IntegrityError:
        session.rollback()
        raise CategoryConflictError()
    return category


def list_categories(
    session: Session,
    user_id: int,
    type_filter: CategoryType | None,
    limit: int,
    cursor: str | None,
    include_deleted: bool,
) -> CategoryListResponse:
    limit = min(max(1, limit), _MAX_LIMIT)
    type_str = type_filter.value if type_filter else None

    conditions = [FinancialCategory.user_id == user_id]
    if type_str:
        conditions.append(FinancialCategory.type == type_str)
    if not include_deleted:
        conditions.append(FinancialCategory.deleted_at.is_(None))

    if cursor:
        pos = _decode_cursor(cursor, type_str, include_deleted, user_id)
        if pos is None:
            raise InvalidCursorError()
        nn, cid = pos
        conditions.append(
            or_(
                FinancialCategory.normalized_name > nn,
                and_(
                    FinancialCategory.normalized_name == nn,
                    FinancialCategory.id > cid,
                ),
            )
        )

    stmt = (
        select(FinancialCategory)
        .where(*conditions)
        .order_by(FinancialCategory.normalized_name.asc(), FinancialCategory.id.asc())
        .limit(limit + 1)
    )
    rows = list(session.exec(stmt).all())

    has_more = len(rows) > limit
    items = rows[:limit]

    next_cursor: str | None = None
    if has_more:
        last = items[-1]
        next_cursor = _encode_cursor(
            last.normalized_name, last.id, type_str, include_deleted, user_id
        )

    return CategoryListResponse(
        items=[_to_response(c) for c in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )


def get_category(session: Session, user_id: int, category_id: int) -> FinancialCategory:
    cat = session.exec(
        select(FinancialCategory).where(
            FinancialCategory.id == category_id,
            FinancialCategory.user_id == user_id,
            FinancialCategory.deleted_at.is_(None),
        )
    ).first()
    if not cat:
        raise CategoryNotFoundError()
    return cat


def update_category(
    session: Session, user_id: int, category_id: int, data: CategoryUpdate
) -> FinancialCategory:
    cat = get_category(session, user_id, category_id)
    if data.name is not None:
        cat.name = data.name
        cat.normalized_name = normalize_name(data.name)
    if data.color_token is not None:
        cat.color_token = data.color_token.value
    cat.updated_at = datetime.now(timezone.utc)
    session.add(cat)
    try:
        session.commit()
        session.refresh(cat)
    except IntegrityError:
        session.rollback()
        raise CategoryConflictError()
    return cat


def delete_category(session: Session, user_id: int, category_id: int) -> None:
    cat = get_category(session, user_id, category_id)
    now = datetime.now(timezone.utc)
    cat.deleted_at = now
    cat.updated_at = now
    session.add(cat)
    session.commit()


def restore_category(session: Session, user_id: int, category_id: int) -> FinancialCategory:
    cat = session.exec(
        select(FinancialCategory).where(
            FinancialCategory.id == category_id,
            FinancialCategory.user_id == user_id,
        )
    ).first()
    if not cat:
        raise CategoryNotFoundError()
    if cat.deleted_at is None:
        raise CategoryNotDeletedError()
    cat.deleted_at = None
    cat.updated_at = datetime.now(timezone.utc)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat
