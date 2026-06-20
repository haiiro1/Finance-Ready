import logging

from sqlmodel import Session

from app.core import gmail
from app.core.config import settings
from app.core.gmail import GmailConfigurationError, GmailDeliveryError

logger = logging.getLogger(__name__)


def send_recovery_email(session: Session, to_email: str, code: str) -> bool:
    body = (
        f"Tu codigo de recuperacion de Finance Ready es:\n\n"
        f"  {code}\n\n"
        f"Este codigo expira en {settings.password_recovery_code_expire_minutes} minutos.\n\n"
        f"Si no solicitaste este codigo, ignora este mensaje."
    )
    return _send(session, to_email, "Recuperacion de contrasena - Finance Ready", body)


def send_verification_email(session: Session, to_email: str, code: str) -> bool:
    body = (
        f"Tu codigo de verificacion de email de Finance Ready es:\n\n"
        f"  {code}\n\n"
        f"Este codigo expira en {settings.email_verification_code_expire_minutes} minutos.\n\n"
        f"Si no creaste esta cuenta, ignora este mensaje."
    )
    return _send(session, to_email, "Verifica tu email - Finance Ready", body)


def _send(session: Session, to_email: str, subject: str, body: str) -> bool:
    try:
        gmail.send_email(session, to_email, subject, body)
        return True
    except GmailConfigurationError as e:
        logger.warning("Gmail no configurado — email no enviado a %s: %s", to_email, e)
    except GmailDeliveryError as e:
        logger.error("Error enviando email a %s (asunto: %s): %s", to_email, subject, e)
    except Exception:
        logger.exception("Error inesperado enviando email a %s (asunto: %s)", to_email, subject)
    return False
