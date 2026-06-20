from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def disable_email_sending():
    with patch("app.core.gmail.send_email", MagicMock(return_value=None)):
        yield
