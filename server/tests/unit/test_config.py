import os
import pytest
from app.core.config import Settings

@pytest.fixture(autouse=True)
def clear_env_vars():
    # Backup and clear relevant env vars before each test
    keys = [
        "mongodb_username", "mongodb_password", "secret_key", "algorithm",
        "secret_key_refresh", "domain", "environment", "ENV_FILE"
    ]
    backup = {k: os.environ.get(k) for k in keys}
    for k in keys:
        os.environ.pop(k, None)
    yield
    # Restore after test
    for k, v in backup.items():
        if v is not None:
            os.environ[k] = v

def test_cookie_config_localhost_in_dev_env():
    os.environ["domain"] = "localhost"
    os.environ["environment"] = "dev"
    os.environ["mongodb_username"] = "test"
    os.environ["mongodb_password"] = "test"
    os.environ["secret_key"] = "test"
    os.environ["secret_key_refresh"] = "test"
    os.environ["algorithm"] = "HS256"

    s = Settings()
    config = s.cookie_config

    assert config["httponly"] is True
    assert config["secure"] is False  # Because dev env
    assert config["samesite"] == "lax"
    assert config["path"] == "/"
    assert "domain" not in config

def test_cookie_config_custom_domain_in_prod_env():
    os.environ["domain"] = "example.com"
    os.environ["environment"] = "prod"
    os.environ["mongodb_username"] = "test"
    os.environ["mongodb_password"] = "test"
    os.environ["secret_key"] = "test"
    os.environ["secret_key_refresh"] = "test"
    os.environ["algorithm"] = "HS256"

    s = Settings()
    config = s.cookie_config

    assert config["secure"] is True  # Because prod env
    assert config["samesite"] == "none"
    assert config["domain"] == "example.com"

def test_cookie_config_localhost_in_test_env():
    os.environ["domain"] = "localhost"
    os.environ["environment"] = "test"
    os.environ["mongodb_username"] = "test"
    os.environ["mongodb_password"] = "test"
    os.environ["secret_key"] = "test"
    os.environ["secret_key_refresh"] = "test"
    os.environ["algorithm"] = "HS256"

    s = Settings()
    config = s.cookie_config

    assert config["secure"] is False
    assert config["samesite"] == "lax"
    assert "domain" not in config

def test_cookie_config_custom_domain_in_dev_env():
    os.environ["domain"] = "dev.example.com"
    os.environ["environment"] = "dev"
    os.environ["mongodb_username"] = "test"
    os.environ["mongodb_password"] = "test"
    os.environ["secret_key"] = "test"
    os.environ["secret_key_refresh"] = "test"
    os.environ["algorithm"] = "HS256"

    s = Settings()
    config = s.cookie_config

    assert config["secure"] is False  # dev env
    assert config["samesite"] == "none"
    assert config["domain"] == "dev.example.com"

def test_cookie_config_custom_domain_in_unknown_env():
    os.environ["domain"] = "example.com"
    os.environ["environment"] = "stage"
    os.environ["mongodb_username"] = "test"
    os.environ["mongodb_password"] = "test"
    os.environ["secret_key"] = "test"
    os.environ["secret_key_refresh"] = "test"
    os.environ["algorithm"] = "HS256"

    s = Settings()
    config = s.cookie_config

    # secure is True because "stage" is not in ["dev", "development", "test"]
    assert config["secure"] is True
    assert config["samesite"] == "none"
    assert config["domain"] == "example.com"
