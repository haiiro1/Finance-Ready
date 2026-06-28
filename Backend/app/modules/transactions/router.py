from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database.models import User
from app.database.session import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.transactions import service
from app.modules.transactions.schemas import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryType,
    CategoryUpdate,
)
from app.modules.transactions.service import (
    CategoryConflictError,
    CategoryNotDeletedError,
    CategoryNotFoundError,
    InvalidCursorError,
)

router = APIRouter()


def _domain_error(
    code: str, message: str, field: str | None = None, http_status: int = 409
) -> None:
    raise HTTPException(
        status_code=http_status,
        detail={"code": code, "message": message, "field": field},
    )


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CategoryResponse:
    try:
        return service.create_category(session, current_user.id, data)
    except CategoryConflictError:
        _domain_error(
            "category_name_conflict",
            "A category with this name and type already exists",
            "name",
        )


@router.get("/categories", response_model=CategoryListResponse)
def list_categories(
    type: CategoryType | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    cursor: str | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CategoryListResponse:
    try:
        return service.list_categories(
            session, current_user.id, type, limit, cursor, include_deleted
        )
    except InvalidCursorError:
        _domain_error(
            "invalid_cursor",
            "Cursor is invalid or does not match current filters",
            "cursor",
            422,
        )


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CategoryResponse:
    try:
        return service.get_category(session, current_user.id, category_id)
    except CategoryNotFoundError:
        _domain_error("category_not_found", "Category not found", http_status=404)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CategoryResponse:
    try:
        return service.update_category(session, current_user.id, category_id, data)
    except CategoryNotFoundError:
        _domain_error("category_not_found", "Category not found", http_status=404)
    except CategoryConflictError:
        _domain_error(
            "category_name_conflict",
            "A category with this name and type already exists",
            "name",
        )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    try:
        service.delete_category(session, current_user.id, category_id)
    except CategoryNotFoundError:
        _domain_error("category_not_found", "Category not found", http_status=404)


@router.post("/categories/{category_id}/restore", response_model=CategoryResponse)
def restore_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CategoryResponse:
    try:
        return service.restore_category(session, current_user.id, category_id)
    except CategoryNotFoundError:
        _domain_error("category_not_found", "Category not found", http_status=404)
    except CategoryNotDeletedError:
        _domain_error("category_not_deleted", "Category is not deleted")
