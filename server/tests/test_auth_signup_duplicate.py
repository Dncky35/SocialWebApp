import pytest

@pytest.mark.asyncio
async def test_signup_duplicate_email(client, clear_test_db):
    data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "securepassword",
        "full_name": "Test User"
    }

    response_first = await client.post("/auth/signup", json=data)
    assert response_first.status_code == 200

    response_second = await client.post("/auth/signup", json=data)
    assert response_second.status_code == 400
    assert response_second.json()["detail"] == "Email already registered."
