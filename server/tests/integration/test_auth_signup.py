import pytest
from httpx import AsyncClient

# Valid signup data
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
    assert data["full_name"] == valid_payload["full_name"]

    # Optional checks for extra fields
    assert "is_verified" in data
    assert "created_at" in data
    assert "password" not in data

    # Check cookie is set
    set_cookie = response.headers.get("set-cookie")
    assert set_cookie is not None
    assert "refreshToken=" in set_cookie


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    # Initial signup
    await client.post("/auth/signup", data=valid_payload)

    # Try again with same email but different username
    payload = valid_payload.copy()
    payload["username"] = "anotheruser"

    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered."

@pytest.mark.asyncio
async def test_signup_duplicate_username(client: AsyncClient):
    # Initial signup
    await client.post("/auth/signup", data=valid_payload)

    # Try again with same username but different email
    payload = valid_payload.copy()
    payload["email"] = "another@example.com"

    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken."