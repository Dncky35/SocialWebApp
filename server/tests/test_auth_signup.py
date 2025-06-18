import pytest
from app.core import database

@pytest.mark.asyncio
async def test_signup_success(client, clear_test_db):
    data={
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "SuperSecretPassword123",
        "full_name": "Test User"
    }
    response = await client.post("/auth/signup", data=data)

    assert response.status_code == 200
    assert response.json() == {"Message": "Account Creation Done"}

    # Double-check document exists in DB
    inserted = await database.account_collection.find_one({"email": "testuser@example.com"})
    assert inserted is not None
    assert inserted["username"] == "testuser"