from dataclasses import dataclass

from google.auth import exceptions as google_exceptions
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import settings


class GoogleTokenError(Exception):
    pass


class GoogleAuthUnavailable(Exception):
    pass


@dataclass
class GoogleIdentityClaims:
    sub: str
    email: str
    email_verified: bool
    name: str | None


def verify_google_id_token(credential: str) -> GoogleIdentityClaims:
    if not settings.google_client_id:
        raise GoogleAuthUnavailable("Google client ID not configured")

    try:
        claims = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except google_exceptions.TransportError as exc:
        raise GoogleAuthUnavailable(f"Error de red al verificar con Google: {exc}") from exc
    except Exception as exc:
        raise GoogleTokenError(str(exc)) from exc

    sub = claims.get("sub")
    email = claims.get("email")
    email_verified = bool(claims.get("email_verified", False))

    if not sub or not email:
        raise GoogleTokenError("Token missing required claims (sub, email)")

    if not email_verified:
        raise GoogleTokenError("Email not verified by Google")

    return GoogleIdentityClaims(
        sub=sub,
        email=email,
        email_verified=email_verified,
        name=claims.get("name"),
    )
