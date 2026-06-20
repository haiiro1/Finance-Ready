import base64
import json
import secrets
import time
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from threading import Lock
from urllib.parse import urlencode

import httpx
from sqlmodel import Session, select

from app.core.config import settings
from app.database.models import GmailCredential

_GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
_GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

_oauth_states: dict[str, float] = {}
_states_lock = Lock()
_STATE_TTL_SECONDS = 300


class GmailConfigurationError(Exception):
    pass


class GmailDeliveryError(Exception):
    pass


def build_authorization_url() -> tuple[str, str]:
    if not settings.gmail_client_id or not settings.gmail_client_secret:
        raise GmailConfigurationError(
            "GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET no configurados."
        )
    if not settings.gmail_sender_email:
        raise GmailConfigurationError("GMAIL_SENDER_EMAIL no configurado.")

    state = secrets.token_urlsafe(16)
    params = {
        "client_id": settings.gmail_client_id,
        "redirect_uri": settings.gmail_redirect_uri,
        "response_type": "code",
        "scope": " ".join(_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "include_granted_scopes": "true",
    }
    return f"{_GMAIL_AUTH_URL}?{urlencode(params)}", state


def store_oauth_state(state: str) -> None:
    with _states_lock:
        now = time.time()
        expired = [
            key for key, created_at in _oauth_states.items()
            if now - created_at > _STATE_TTL_SECONDS
        ]
        for key in expired:
            del _oauth_states[key]
        _oauth_states[state] = now


def verify_and_consume_oauth_state(state: str) -> bool:
    with _states_lock:
        created_at = _oauth_states.pop(state, None)
        if created_at is None:
            return False
        return time.time() - created_at <= _STATE_TTL_SECONDS


def exchange_code_for_token(code: str) -> str:
    response = httpx.post(
        _GMAIL_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.gmail_client_id,
            "client_secret": settings.gmail_client_secret,
            "redirect_uri": settings.gmail_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    response.raise_for_status()
    token_data = response.json()
    if "refresh_token" not in token_data:
        raise GmailDeliveryError(
            "Google no devolvio refresh_token. "
            "Revoca el acceso anterior y conecta Gmail nuevamente."
        )
    return _serialize_token(token_data)


def upsert_gmail_credential(session: Session, token_json: str) -> GmailCredential:
    email = settings.gmail_sender_email.strip().lower()
    if not email:
        raise GmailConfigurationError("GMAIL_SENDER_EMAIL no configurado.")

    credential = session.exec(
        select(GmailCredential).where(GmailCredential.email == email)
    ).first()
    now = datetime.now(timezone.utc)
    if credential:
        credential.token_json = token_json
        credential.updated_at = now
    else:
        credential = GmailCredential(email=email, token_json=token_json)

    session.add(credential)
    session.commit()
    session.refresh(credential)
    return credential


def get_connected_gmail_credential(session: Session) -> GmailCredential | None:
    return session.exec(select(GmailCredential)).first()


def disconnect_gmail(session: Session) -> int:
    credentials = session.exec(select(GmailCredential)).all()
    count = len(credentials)
    for credential in credentials:
        session.delete(credential)
    session.commit()
    return count


def send_email(
    session: Session,
    to_email: str,
    subject: str,
    body: str,
) -> None:
    credential = get_connected_gmail_credential(session)
    if credential:
        token_json = credential.token_json
        access_token, refreshed_token_json = _get_access_token_from_token_json(token_json)
        if refreshed_token_json:
            credential.token_json = refreshed_token_json
            credential.updated_at = datetime.now(timezone.utc)
            session.add(credential)
            session.commit()
        _send_via_gmail(to_email, subject, body, access_token)
        return

    if settings.gmail_refresh_token:
        access_token = _get_access_token_from_refresh_token(settings.gmail_refresh_token)
        _send_via_gmail(to_email, subject, body, access_token)
        return

    raise GmailConfigurationError(
        "No hay cuenta Gmail conectada ni GMAIL_REFRESH_TOKEN configurado."
    )


def _serialize_token(token_data: dict) -> str:
    expires_in = int(token_data.get("expires_in", 3600))
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    payload = {
        "access_token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "token_type": token_data.get("token_type", "Bearer"),
        "scope": token_data.get("scope", " ".join(_SCOPES)),
        "expires_at": expires_at.isoformat(),
    }
    return json.dumps(payload)


def _get_access_token_from_token_json(token_json: str) -> tuple[str, str | None]:
    token_data = json.loads(token_json)
    expires_at = datetime.fromisoformat(token_data["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at > datetime.now(timezone.utc) + timedelta(seconds=60):
        return str(token_data["access_token"]), None

    refreshed_token = _refresh_token(token_data["refresh_token"])
    return str(json.loads(refreshed_token)["access_token"]), refreshed_token


def _get_access_token_from_refresh_token(refresh_token: str) -> str:
    token_json = _refresh_token(refresh_token)
    return str(json.loads(token_json)["access_token"])


def _refresh_token(refresh_token: str) -> str:
    response = httpx.post(
        _GMAIL_TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "client_id": settings.gmail_client_id,
            "client_secret": settings.gmail_client_secret,
            "refresh_token": refresh_token,
        },
        timeout=10,
    )
    response.raise_for_status()
    token_data = response.json()
    token_data["refresh_token"] = refresh_token
    return _serialize_token(token_data)


def _send_via_gmail(to_email: str, subject: str, body: str, access_token: str) -> None:
    msg = MIMEText(body, "plain", "utf-8")
    msg["From"] = settings.gmail_sender_email
    msg["To"] = to_email
    msg["Subject"] = subject

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("ascii")
    response = httpx.post(
        _GMAIL_SEND_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        json={"raw": raw},
        timeout=10,
    )
    response.raise_for_status()
