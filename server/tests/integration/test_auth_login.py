import pytest 

@pytest.mark.asyncio
async def test_login_success(client):
    # create a test account
    payload = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "securepassword",
        "full_name": "Test User"
    }
    response = await client.post("/auth/signup", data=payload)
    assert response.status_code == 200

    

