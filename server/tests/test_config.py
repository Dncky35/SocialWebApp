import os
import pytest
from app.core.config import Settings

@pytest.fixture(autouse=True)
def clear_env_vars():
    # Backup and clear relevant env vars before each test
    keys = ["mongodb_username", "mongodb_password", "secret_key", "algorithm", "secret_key_refresh", "cookie_domain"]
    backup = {k: os.environ.get(k) for k in keys}
    for k in keys:
        if k in os.environ:
            del os.environ[k]
    yield
    # Restore after test
    for k, v in backup.items():
        if v is not None:
            os.environ[k] = v

def test_settings_load_env_vars(monkeypatch):
    monkeypatch.setenv("mongodb_username", "testuser")
    monkeypatch.setenv("mongodb_password", "testpass")
    monkeypatch.setenv("secret_key", "secret123")
    monkeypatch.setenv("algorithm", "HS256")
    monkeypatch.setenv("secret_key_refresh", "refreshsecret")
    monkeypatch.setenv("cookie_domain", "localhost")

    settings = Settings()

    assert settings.mongodb_username == "testuser"
    assert settings.mongodb_password == "testpass"
    assert settings.secret_key == "secret123"
    assert settings.algorithm == "HS256"
    assert settings.secret_key_refresh == "refreshsecret"
    assert settings.cookie_domain == "localhost"

def test_cookie_config_localhost():
    s = Settings(cookie_domain="localhost")
    config = s.cookie_config
    assert config["httponly"] is True
    assert config["secure"] is False
    assert config["samesite"] == "lax"
    assert config["path"] == "/"
    assert "domain" not in config

def test_cookie_config_empty_domain():
    s = Settings(cookie_domain="")
    config = s.cookie_config
    assert config["secure"] is False
    assert config["samesite"] == "lax"
    assert "domain" not in config

def test_cookie_config_none_domain():
    s = Settings(cookie_domain=None)
    config = s.cookie_config
    assert config["secure"] is False
    assert config["samesite"] == "lax"
    assert "domain" not in config

def test_cookie_config_custom_domain():
    s = Settings(cookie_domain="example.com")
    config = s.cookie_config
    assert config["secure"] is True
    assert config["samesite"] == "none"
    assert config["domain"] == "example.com"
