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
    response_create = await client.post("/auth/signup", data=payload)
    assert response_create.status_code == 200

    login_payload={
        "username": "testuser@example.com",
        "password": "securepassword"
    }

    response_login = await client.post("/auth/login", data=login_payload)
    assert response_login.status_code == 202
    
@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    # create a test account
    payload = {
        "email": "testuser2@example.com",
        "username": "testuser2",
        "password": "securepassword",
        "full_name": "Test User"
    }
    response_create = await client.post("/auth/signup", data=payload)
    assert response_create.status_code == 200

    # wrong username
    login_payload={
        "username": "testuser@example.com",
        "password": "securepassword"
    }

    response_login = await client.post("/auth/login", data=login_payload)
    assert response_login.status_code == 401

    #wrong password 
    login_payload={
        "username": "testuser2@example.com",
        "password": "securepassword2"
    }

    response_login = await client.post("/auth/login", data=login_payload)
    assert response_login.status_code == 401

    #wrong password wrong username
    login_payload={
        "username": "testuser@example.com",
        "password": "securepassword2"
    }

    response_login = await client.post("/auth/login", data=login_payload)
    assert response_login.status_code == 401