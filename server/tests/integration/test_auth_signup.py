import pytest

@pytest.mark.asyncio
async def test_signup_success(client):
    payload = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "securepassword",
        "full_name": "Test User"
    }
    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_signup_duplicate_email(client):
    payload = {
        "email": "testuser2@example.com",
        "username": "testuser2",
        "password": "securepassword",
        "full_name": "Test User"
    }
    await client.post("/auth/signup", data=payload)

    # Try same email again
    payload_duplicate = {
        "email": "testuser2@example.com",  # same email
        "username": "newuser",
        "password": "securepassword",
        "full_name": "New User"
    }
    response = await client.post("/auth/signup", data=payload_duplicate)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_signup_duplicate_username(client):
    payload = {
        "email": "testuser2@example.com",
        "username": "testuser2",
        "password": "securepassword",
        "full_name": "Test User"
    }
    await client.post("/auth/signup", data=payload)

     # Try same email again
    payload_duplicate = {
        "email": "testuser3@example.com",  # same email
        "username": "testuser2",
        "password": "securepassword",
        "full_name": "New User"
    }
    response = await client.post("/auth/signup", data=payload_duplicate)
    assert response.status_code == 400