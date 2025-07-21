import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_verify_access_token(logged_client: AsyncClient):
    response = await logged_client.get("/auth/verify_access_token")
    assert response.status_code == 200
    assert response.json() == {"result": "Access token is valid."}

@pytest.mark.asyncio
async def test_verify_access_token_missing(client: AsyncClient):
    response = await client.get("/auth/verify_access_token")
    
    assert response.status_code == 401
    assert response.json() == {"detail": "Access token missing"}  # <== match your real response


@pytest.mark.asyncio
async def test_verify_access_token_invalid(client: AsyncClient):
    client.cookies.set("accessToken", "this.is.an.invalid.token")

    response = await client.get("/auth/verify_access_token")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}  # <== match your real response