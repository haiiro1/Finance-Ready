from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.database.models import User
from app.modules.auth.schemas import (
    AuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.modules.auth.security import create_access_token, hash_password, verify_password


class CredentialsError(Exception):
    pass


class InactiveUserError(Exception):
    pass


def register_user(request: UserRegisterRequest, session: Session) -> AuthResponse:
    email = request.email.strip().lower()

    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        email=email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
    )
    session.add(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise ValueError("Email already registered")
    session.refresh(user)

    token = create_access_token(subject=user.id)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
        ),
    )


def authenticate_user(email: str, password: str, session: Session) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise CredentialsError("Invalid credentials")
    if not user.is_active:
        raise InactiveUserError("User is inactive")
    return user


def login_user(request: UserLoginRequest, session: Session) -> AuthResponse:
    email = request.email.strip().lower()
    user = authenticate_user(email, request.password, session)
    token = create_access_token(subject=user.id)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
        ),
    )
