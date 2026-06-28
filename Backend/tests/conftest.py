from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def disable_email_sending():
    with patch("app.core.email.resend.Emails.send", MagicMock(return_value={"id": "test"})):
        yield
