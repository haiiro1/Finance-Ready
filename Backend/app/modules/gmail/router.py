import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, SQLModel

from app.core import gmail
from app.core.config import settings
from app.core.gmail import GmailConfigurationError, GmailDeliveryError
from app.database.models import User
from app.database.session import get_session
from app.modules.auth.dependencies import get_current_user, get_current_user_optional

_bearer = HTTPBearer(auto_error=False)

logger = logging.getLogger(__name__)

router = APIRouter()


class GmailStatusResponse(SQLModel):
    connected: bool
    email: str | None = None


class GmailDisconnectResponse(SQLModel):
    message: str
    removed: int


class GmailAuthUrlResponse(SQLModel):
    auth_url: str


def _require_gmail_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    x_admin_setup_token: str | None = Header(default=None),
    current_user: User | None = Depends(get_current_user_optional),
) -> None:
    if current_user is not None:
        return
    if (
        x_admin_setup_token
        and settings.admin_setup_token
        and x_admin_setup_token == settings.admin_setup_token
    ):
        return
    detail = (
        "Token invalido o usuario sin verificar."
        if credentials is not None
        else "Se requiere autenticacion o ADMIN_SETUP_TOKEN."
    )
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


@router.get("/auth", response_model=GmailAuthUrlResponse)
def gmail_auth(
    _auth: None = Depends(_require_gmail_auth),
) -> GmailAuthUrlResponse:
    try:
        auth_url, state = gmail.build_authorization_url()
        gmail.store_oauth_state(state)
        return GmailAuthUrlResponse(auth_url=auth_url)
    except GmailConfigurationError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))


@router.get("/callback")
def gmail_callback(
    code: str = Query(...),
    state: str = Query(...),
    session: Session = Depends(get_session),
) -> RedirectResponse:
    if not gmail.verify_and_consume_oauth_state(state):
        return RedirectResponse(
            url=f"{settings.frontend_url}?gmail=error&reason=invalid_state",
            status_code=status.HTTP_302_FOUND,
        )
    try:
        token_json = gmail.exchange_code_for_token(code)
        gmail.upsert_gmail_credential(session, token_json)
        return RedirectResponse(
            url=f"{settings.frontend_url}?gmail=connected",
            status_code=status.HTTP_302_FOUND,
        )
    except GmailDeliveryError as e:
        logger.error("Gmail callback error: %s", e)
        return RedirectResponse(
            url=f"{settings.frontend_url}?gmail=error&reason=no_refresh_token",
            status_code=status.HTTP_302_FOUND,
        )
    except Exception:
        logger.exception("Gmail callback unexpected error")
        return RedirectResponse(
            url=f"{settings.frontend_url}?gmail=error&reason=unknown",
            status_code=status.HTTP_302_FOUND,
        )


@router.get("/status", response_model=GmailStatusResponse)
def gmail_status(
    _current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> GmailStatusResponse:
    credential = gmail.get_connected_gmail_credential(session)
    if credential:
        return GmailStatusResponse(connected=True, email=credential.email)
    return GmailStatusResponse(connected=False)


@router.post("/disconnect", response_model=GmailDisconnectResponse)
def gmail_disconnect(
    _current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> GmailDisconnectResponse:
    removed = gmail.disconnect_gmail(session)
    return GmailDisconnectResponse(
        message="Gmail desconectado." if removed else "No habia cuenta Gmail conectada.",
        removed=removed,
    )
