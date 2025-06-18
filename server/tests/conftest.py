import pytest
from unittest.mock import AsyncMock, patch

@pytest.fixture(autouse=True)
def patch_motor_client_and_init_beanie():
    with patch("app.core.database.AsyncIOMotorClient") as mock_client, \
         patch("app.core.database.init_beanie", new_callable=AsyncMock) as mock_init_beanie:
        mock_client.return_value = AsyncMock()
        yield mock_client, mock_init_beanie
