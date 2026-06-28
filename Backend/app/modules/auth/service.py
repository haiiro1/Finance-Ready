from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.core.config import settings
from app.core.email import send_recovery_email, send_verification_email
from app.database.models import EmailVerificationCode, PasswordRecoveryCode, User
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
from app.modules.auth.security import (
    create_access_token,
    generate_recovery_code,
    generate_verification_code,
    hash_password,
    hash_recovery_code,
    hash_verification_code,
    verify_password,
)


class CredentialsError(Exception):
    pass


class InactiveUserError(Exception):
    pass


class EmailNotVerifiedError(Exception):
    pass


class InvalidRecoveryCodeError(Exception):
    pass


class InvalidVerificationCodeError(Exception):
    pass


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        email_verified=user.email_verified,
    )


def _create_verification_code_record(user: User, session: Session) -> str:
    now = datetime.now(timezone.utc)
    active_codes = session.exec(
        select(EmailVerificationCode).where(
            EmailVerificationCode.user_id == user.id,
            EmailVerificationCode.used_at.is_(None),  # type: ignore[union-attr]
        )
    ).all()
    for record in active_codes:
        record.used_at = now
        session.add(record)

    plain_code = generate_verification_code()
    session.add(
        EmailVerificationCode(
            user_id=user.id,
            code_hash=hash_verification_code(plain_code),
            expires_at=now
            + timedelta(minutes=settings.email_verification_code_expire_minutes),
        )
    )
    session.commit()
    return plain_code


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

    plain_code = _create_verification_code_record(user, session)
    email_sent = send_verification_email(user.email, plain_code)

    token = create_access_token(subject=user.id)
    verification_code_in_response = (
        plain_code if settings.app_env in ("local", "development") else None
    )
    return RegisterResponse(
        access_token=token,
        token_type="bearer",
        user=_user_response(user),
        verification_code=verification_code_in_response,
        email_sent=email_sent,
    )


def authenticate_user(email: str, password: str, session: Session) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise CredentialsError("Invalid credentials")
    if not user.is_active:
        raise InactiveUserError("User is inactive")
    if not user.email_verified:
        raise EmailNotVerifiedError("Email not verified")
    return user


def login_user(request: UserLoginRequest, session: Session) -> AuthResponse:
    email = request.email.strip().lower()
    user = authenticate_user(email, request.password, session)
    token = create_access_token(subject=user.id)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=_user_response(user),
    )


_GENERIC_RECOVERY_MESSAGE = (
    "If the account exists, password recovery instructions were generated."
)
_INVALID_CODE_MESSAGE = "Invalid or expired recovery code."
_GENERIC_VERIFICATION_MESSAGE = (
    "If the account exists, email verification instructions were generated."
)
_INVALID_VERIFICATION_MESSAGE = "Invalid or expired verification code."


def request_password_recovery(
    request: PasswordRecoveryRequest, session: Session
) -> PasswordRecoveryRequestResponse:
    email = request.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()

    if not user or not user.is_active:
        return PasswordRecoveryRequestResponse(message=_GENERIC_RECOVERY_MESSAGE)

    now = datetime.now(timezone.utc)
    active_codes = session.exec(
        select(PasswordRecoveryCode).where(
            PasswordRecoveryCode.user_id == user.id,
            PasswordRecoveryCode.used_at.is_(None),  # type: ignore[union-attr]
        )
    ).all()
    for code_record in active_codes:
        code_record.used_at = now
        session.add(code_record)

    plain_code = generate_recovery_code()
    session.add(
        PasswordRecoveryCode(
            user_id=user.id,
            code_hash=hash_recovery_code(plain_code),
            expires_at=now
            + timedelta(minutes=settings.password_recovery_code_expire_minutes),
        )
    )
    session.commit()

    email_sent = send_recovery_email(user.email, plain_code)

    recovery_code_in_response = (
        plain_code if settings.app_env in ("local", "development") else None
    )
    return PasswordRecoveryRequestResponse(
        message=_GENERIC_RECOVERY_MESSAGE,
        recovery_code=recovery_code_in_response,
        email_sent=email_sent,
    )


def confirm_password_reset(
    request: PasswordResetConfirmRequest, session: Session
) -> PasswordResetConfirmResponse:
    email = request.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()

    if not user or not user.is_active:
        raise InvalidRecoveryCodeError(_INVALID_CODE_MESSAGE)

    code_hash = hash_recovery_code(request.code)
    recovery = session.exec(
        select(PasswordRecoveryCode).where(
            PasswordRecoveryCode.code_hash == code_hash,
            PasswordRecoveryCode.user_id == user.id,
        )
    ).first()

    if not recovery:
        raise InvalidRecoveryCodeError(_INVALID_CODE_MESSAGE)
    if recovery.used_at is not None:
        raise InvalidRecoveryCodeError(_INVALID_CODE_MESSAGE)

    now = datetime.now(timezone.utc)
    expires_at = recovery.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise InvalidRecoveryCodeError(_INVALID_CODE_MESSAGE)

    user.hashed_password = hash_password(request.new_password)
    user.updated_at = now
    recovery.used_at = now
    session.add(user)
    session.add(recovery)
    session.commit()

    return PasswordResetConfirmResponse(message="Password updated successfully.")


def confirm_email_verification(
    request: EmailVerificationConfirmRequest, session: Session
) -> EmailVerificationConfirmResponse:
    email = request.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        raise InvalidVerificationCodeError(_INVALID_VERIFICATION_MESSAGE)

    if user.email_verified:
        return EmailVerificationConfirmResponse(message="Email already verified.")

    code_hash = hash_verification_code(request.code)
    verification = session.exec(
        select(EmailVerificationCode).where(
            EmailVerificationCode.code_hash == code_hash,
            EmailVerificationCode.user_id == user.id,
        )
    ).first()

    if not verification:
        raise InvalidVerificationCodeError(_INVALID_VERIFICATION_MESSAGE)
    if verification.used_at is not None:
        raise InvalidVerificationCodeError(_INVALID_VERIFICATION_MESSAGE)

    now = datetime.now(timezone.utc)
    expires_at = verification.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise InvalidVerificationCodeError(_INVALID_VERIFICATION_MESSAGE)

    user.email_verified = True
    user.updated_at = now
    verification.used_at = now
    session.add(user)
    session.add(verification)
    session.commit()

    return EmailVerificationConfirmResponse(message="Email verified successfully.")


def resend_email_verification(
    request: EmailVerificationResendRequest, session: Session
) -> EmailVerificationResendResponse:
    email = request.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()

    if not user or not user.is_active or user.email_verified:
        return EmailVerificationResendResponse(message=_GENERIC_VERIFICATION_MESSAGE)

    plain_code = _create_verification_code_record(user, session)
    email_sent = send_verification_email(user.email, plain_code)

    verification_code_in_response = (
        plain_code if settings.app_env in ("local", "development") else None
    )
    return EmailVerificationResendResponse(
        message=_GENERIC_VERIFICATION_MESSAGE,
        verification_code=verification_code_in_response,
        email_sent=email_sent,
    )
