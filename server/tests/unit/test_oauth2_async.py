import pytest
import asyncio
from fastapi import HTTPException
from unittest.mock import AsyncMock, patch
from app.core import oauth2
from app.schemas.token import TokenData
from bson import ObjectId

VALID_OBJECT_ID = "64d6a4e7f8d4e3a1b2c3d4e5"

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_current_user_success(mock_find_one):
    mock_find_one.return_value = {"_id": ObjectId(VALID_OBJECT_ID), "username": "user1"}

    token = oauth2.create_token({"account_id": VALID_OBJECT_ID}, is_access_token=True)
    user = await oauth2.get_current_user(token=token)
    assert user.account_id == VALID_OBJECT_ID

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_current_user_no_token(mock_find_one):
    with pytest.raises(HTTPException) as exc_info:
        await oauth2.get_current_user(token=None)
    assert exc_info.value.status_code == 401
    assert "missing" in exc_info.value.detail.lower()

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_current_user_user_not_found(mock_find_one):
    mock_find_one.return_value = None
    token = oauth2.create_token({"account_id": VALID_OBJECT_ID}, is_access_token=True)
    import pytest
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await oauth2.get_current_user(token=token)
    assert exc_info.value.status_code == 401
    assert "not found" in exc_info.value.detail.lower()

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_logged_in_user_success(mock_find_one):
    mock_find_one.return_value = {"_id": ObjectId(VALID_OBJECT_ID), "username": "user2"}

    token = oauth2.create_token({"account_id": VALID_OBJECT_ID})
    user = await oauth2.get_logged_in_user(token=token)
    assert user.account_id == VALID_OBJECT_ID

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_logged_in_user_no_token(mock_find_one):
    with pytest.raises(HTTPException) as exc_info:
        await oauth2.get_logged_in_user(token=None)
    assert exc_info.value.status_code == 401
    assert "missing" in exc_info.value.detail.lower()

@pytest.mark.asyncio
@patch("app.models.Account.find_one", new_callable=AsyncMock)
async def test_get_logged_in_user_user_not_found(mock_find_one):
    mock_find_one.return_value = None

    token = oauth2.create_token({"account_id": VALID_OBJECT_ID})
    with pytest.raises(HTTPException) as exc_info:
        await oauth2.get_logged_in_user(token=token)
    assert exc_info.value.status_code == 401
    assert "not found" in exc_info.value.detail.lower()
