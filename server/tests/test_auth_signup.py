import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core import database

@pytest.mark.asyncio
async def test_signup_success():
    # CLEAN DB before test
    await database.account_collection.delete_many({"email": "testuser@example.com"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/auth/signup",
            data={
                "email": "testuser@example.com",
                "username": "testuser",
                "password": "SuperSecretPassword123",
                "full_name": "Test User"
            }
        )

    assert response.status_code == 200
    assert response.json() == {"Message": "Account Creation Done"}

    # Double-check document exists in DB
    inserted = await database.account_collection.find_one({"email": "testuser@example.com"})
    assert inserted is not None
    assert inserted["username"] == "testuser"