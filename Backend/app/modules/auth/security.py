import hmac
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str | int, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {
        "sub": str(subject),
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc


def get_token_subject(token: str) -> str:
    payload = decode_access_token(token)
    sub = payload.get("sub")
    if not sub:
        raise ValueError("Token missing subject")
    return sub


def generate_recovery_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_recovery_code(code: str) -> str:
    return hmac.new(
        settings.secret_key.encode(), code.encode(), "sha256"
    ).hexdigest()


def verify_recovery_code(code: str, code_hash: str) -> bool:
    expected = hash_recovery_code(code)
    return hmac.compare_digest(expected, code_hash)


generate_verification_code = generate_recovery_code
hash_verification_code = hash_recovery_code
verify_verification_code = verify_recovery_code
