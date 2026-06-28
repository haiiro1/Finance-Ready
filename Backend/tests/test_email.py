from unittest.mock import patch

from app.core.config import settings
from app.core.email import send_verification_email


def test_verification_email_is_sent_with_resend():
    with (
        patch.object(settings, "resend_api_key", "re_test"),
        patch.object(settings, "email_from", "no-reply@example.com"),
        patch.object(settings, "email_from_name", "Finance Ready"),
        patch("app.core.email.resend.Emails.send", return_value={"id": "email-id"}) as send,
    ):
        delivered = send_verification_email("user@example.com", "123456")

    assert delivered is True
    payload = send.call_args.args[0]
    assert payload["from"] == "Finance Ready <no-reply@example.com>"
    assert payload["to"] == ["user@example.com"]
    assert payload["text"].find("123456") >= 0


def test_email_is_not_sent_without_resend_configuration():
    with (
        patch.object(settings, "resend_api_key", ""),
        patch.object(settings, "email_from", ""),
        patch("app.core.email.resend.Emails.send") as send,
    ):
        delivered = send_verification_email("user@example.com", "123456")

    assert delivered is False
    send.assert_not_called()
