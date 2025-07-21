import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_verify_access_token(logged_client: AsyncClient):
    response = await logged_client.get("/auth/verify_access_token")
    assert response.status_code == 200
    assert response.json() == {"result": "Access token is valid."}