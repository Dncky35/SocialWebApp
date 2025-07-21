import pytest
from httpx import AsyncClient
from fastapi import status
from unittest.mock import patch

@pytest.mark.asyncio
async def test_verify_refresh_token_success(client: AsyncClient):
    valid_token = "valid_refresh_token_example"

    # Mock oauth2.verify_token to not raise exception on valid token
    with patch("app.core.oauth2.verify_token") as mock_verify:
        mock_verify.return_value = None  # No exception means valid token

        response = await client.get("/auth/verify_refresh_token", cookies={"refreshToken": valid_token})

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"result": "Refresh token is valid."}
        mock_verify.assert_called_once_with(valid_token)


@pytest.mark.asyncio
async def test_verify_refresh_token_missing_token(client: AsyncClient):
    response = await client.get("/auth/verify_refresh_token")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Refresh token missing."


@pytest.mark.asyncio
async def test_verify_refresh_token_invalid_token(client: AsyncClient):
    invalid_token = "invalid_token_example"

    # Mock oauth2.verify_token to raise HTTPException on invalid token
    from fastapi import HTTPException

    def raise_http_exception(token):
        raise HTTPException(status_code=401, detail="Invalid token")

    with patch("app.core.oauth2.verify_token", side_effect=raise_http_exception) as mock_verify:
        response = await client.get("/auth/verify_refresh_token", cookies={"refreshToken": invalid_token})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["detail"] == "Invalid token"
        mock_verify.assert_called_once_with(invalid_token)
