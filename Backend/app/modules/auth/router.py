from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.models import User
from app.database.session import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import (
    AuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.modules.auth.service import CredentialsError, InactiveUserError, login_user, register_user

router = APIRouter()


@router.get("/status")
def auth_status() -> dict[str, str]:
    return {"module": "auth", "status": "active"}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    try:
        return register_user(request, session)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(
    request: UserLoginRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    try:
        return login_user(request, session)
    except CredentialsError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except InactiveUserError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )
