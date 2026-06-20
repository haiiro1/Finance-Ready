from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.database.models import User
from app.modules.auth.schemas import RegisterResponse, UserRegisterRequest, UserResponse
from app.modules.auth.security import create_access_token, hash_password


def register_user(request: UserRegisterRequest, session: Session) -> RegisterResponse:
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

    return RegisterResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
        ),
    )
