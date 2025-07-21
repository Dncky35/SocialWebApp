import pytest
from httpx import AsyncClient

# Sample reusable test data
valid_payload = {
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "securepassword",
    "full_name": "Test User"
}

@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient):
    response = await client.post("/auth/signup", data=valid_payload)

    assert response.status_code == 200
    data = response.json()

    assert data["email"] == valid_payload["email"]
    assert data["username"] == valid_payload["username"]
    assert "password" not in data  # Should not expose password
    assert response.cookies.get("refreshToken") is not None


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    # First signup
    await client.post("/auth/signup", data=valid_payload)

    # Duplicate email but different username
    payload = valid_payload.copy()
    payload["username"] = "newuser"

    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered."


@pytest.mark.asyncio
async def test_signup_duplicate_username(client: AsyncClient):
    # First signup
    await client.post("/auth/signup", data=valid_payload)

    # Duplicate username but different email
    payload = valid_payload.copy()
    payload["email"] = "newemail@example.com"

    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken."
