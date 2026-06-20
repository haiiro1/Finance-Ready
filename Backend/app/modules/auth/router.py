from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.models import User
from app.database.session import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import (
    AuthResponse,
    EmailVerificationConfirmRequest,
    EmailVerificationConfirmResponse,
    EmailVerificationResendRequest,
    EmailVerificationResendResponse,
    PasswordRecoveryRequest,
    PasswordRecoveryRequestResponse,
    PasswordResetConfirmRequest,
    PasswordResetConfirmResponse,
    RegisterResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.modules.auth.service import (
    CredentialsError,
    EmailNotVerifiedError,
    InactiveUserError,
    InvalidRecoveryCodeError,
    InvalidVerificationCodeError,
    confirm_email_verification,
    confirm_password_reset,
    login_user,
    register_user,
    request_password_recovery,
    resend_email_verification,
)

router = APIRouter()


@router.get("/status")
def auth_status() -> dict[str, str]:
    return {"module": "auth", "status": "active"}


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    session: Session = Depends(get_session),
) -> RegisterResponse:
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
    except (InactiveUserError, EmailNotVerifiedError) as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        email_verified=current_user.email_verified,
    )


@router.post("/password-recovery/request", response_model=PasswordRecoveryRequestResponse)
def password_recovery_request(
    request: PasswordRecoveryRequest,
    session: Session = Depends(get_session),
) -> PasswordRecoveryRequestResponse:
    return request_password_recovery(request, session)


@router.post("/password-recovery/confirm", response_model=PasswordResetConfirmResponse)
def password_recovery_confirm(
    request: PasswordResetConfirmRequest,
    session: Session = Depends(get_session),
) -> PasswordResetConfirmResponse:
    try:
        return confirm_password_reset(request, session)
    except InvalidRecoveryCodeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/email-verification/confirm", response_model=EmailVerificationConfirmResponse
)
def email_verification_confirm(
    request: EmailVerificationConfirmRequest,
    session: Session = Depends(get_session),
) -> EmailVerificationConfirmResponse:
    try:
        return confirm_email_verification(request, session)
    except InvalidVerificationCodeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/email-verification/resend", response_model=EmailVerificationResendResponse
)
def email_verification_resend(
    request: EmailVerificationResendRequest,
    session: Session = Depends(get_session),
) -> EmailVerificationResendResponse:
    return resend_email_verification(request, session)
