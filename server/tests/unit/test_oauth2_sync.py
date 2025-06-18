import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt, ExpiredSignatureError
from fastapi import HTTPException
from app.core import oauth2
from app.core.config import settings

def test_create_token_and_verify():
    data = {"account_id": "123", "role": "admin"}

    # Create access token
    token = oauth2.create_token(data, is_access_token=True)
    assert isinstance(token, str)

    # Decode token manually to check payload
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    assert payload["sub"] == "123"
    assert payload["role"] == "admin"
    assert "exp" in payload

    # Verify token with correct function
    token_data = oauth2.verify_token(token, is_access_token=True)
    assert token_data.account_id == "123"
    assert token_data.role == "admin"

def test_create_refresh_token_and_verify():
    data = {"account_id": "456", "role": "user"}

    token = oauth2.create_token(data, is_access_token=False)
    payload = jwt.decode(token, settings.secret_key_refresh, algorithms=[settings.algorithm])

    assert payload["sub"] == "456"
    assert payload["role"] == "user"
    assert "exp" in payload

    token_data = oauth2.verify_token(token, is_access_token=False)
    assert token_data.account_id == "456"
    assert token_data.role == "user"

def test_verify_token_invalid_token():
    invalid_token = "this.is.not.a.valid.token"
    with pytest.raises(HTTPException) as exc_info:
        oauth2.verify_token(invalid_token)
    assert exc_info.value.status_code == 401
    assert "Invalid token" in exc_info.value.detail

def test_verify_token_expired(monkeypatch):
    # Create token with past expiration
    data = {"account_id": "789"}
    token = oauth2.create_token(data, is_access_token=True)

    # Patch jwt.decode to raise ExpiredSignatureError
    def fake_decode(*args, **kwargs):
        raise ExpiredSignatureError()

    monkeypatch.setattr(oauth2.jwt, "decode", fake_decode)

    with pytest.raises(HTTPException) as exc_info:
        oauth2.verify_token(token)
    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()
