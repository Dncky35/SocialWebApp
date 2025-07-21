import pytest
from httpx import AsyncClient
from app.models.account import Account
from app.core import utils
from fastapi import status
from unittest.mock import patch

user_data = {
    "email": "loginuser@example.com",
    "username": "loginuser",
    "password": "testpassword",
    "full_name": "Login User"
}

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db):
    # Pre-create user in DB (simulate signup)
    hashed_pw = utils.hash_password(user_data["password"])
    account = Account(
        email=user_data["email"],
        username=user_data["username"],
        password=hashed_pw,
        full_name=user_data["full_name"],
    )
    await account.insert()

    # Prepare login form data (OAuth2PasswordRequestForm expects form-encoded data)
    form_data = {
        "username": user_data["email"],  # OAuth2PasswordRequestForm uses 'username' field for email/login
        "password": user_data["password"],
    }

    response = await client.post("/auth/login", data=form_data)
    assert response.status_code == 202

    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert data["full_name"] == user_data["full_name"]

    # Check cookie set in response headers
    set_cookie = response.headers.get("set-cookie")
    assert set_cookie is not None
    assert "refreshToken=" in set_cookie

@pytest.mark.asyncio
async def test_login_invalid_email(client: AsyncClient, db):
    form_data = {
        "username": "nonexistent@example.com",
        "password": "any_password",
    }

    response = await client.post("/auth/login", data=form_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, db):
    # Create user with known password
    hashed_pw = utils.hash_password("correct_password")
    account = Account(
        email=user_data["email"],
        username=user_data["username"],
        password=hashed_pw,
        full_name=user_data["full_name"],
    )
    await account.insert()

    form_data = {
        "username": user_data["email"],
        "password": "wrong_password",
    }

    response = await client.post("/auth/login", data=form_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


# @pytest.mark.asyncio
# async def test_logout_clears_cookies(client: AsyncClient):
#     response = await client.post("/auth/logout")
#     assert response.status_code == 200
#     data = response.json()
#     assert data["message"] == "Logged out successfully"

#     # ✅ Cookies deleted (set with expired date or max-age=0)
#     set_cookie_headers = response.headers.get_list("set-cookie")
#     access_cookie = next((c for c in set_cookie_headers if "accessToken=" in c), None)
#     refresh_cookie = next((c for c in set_cookie_headers if "refreshToken=" in c), None)

#     assert access_cookie is not None
#     assert "Max-Age=0" in access_cookie or "Expires=" in access_cookie

#     assert refresh_cookie is not None
#     assert "Max-Age=0" in refresh_cookie or "Expires=" in refresh_cookie

