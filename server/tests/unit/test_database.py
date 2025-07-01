import pytest
import importlib
import os
from app.core import database
from app.core import config

@pytest.mark.asyncio
async def test_init_db_calls_init_beanie(patch_motor_client_and_init_beanie):
    mock_client, mock_init_beanie = patch_motor_client_and_init_beanie

    await database.init_db()

    # Check init_beanie was called exactly once
    mock_init_beanie.assert_awaited_once()

    # Check that init_beanie was called with correct database
    called_args, called_kwargs = mock_init_beanie.call_args
    assert called_kwargs.get("database") == database.db

    # Check document_models include Account model by name
    assert any("Account" in str(model) for model in called_kwargs.get("document_models", []))

def test_testing_db_name(monkeypatch):
    monkeypatch.setenv("ENV_FILE", ".env.test")
    monkeypatch.setenv("environment", "test")
    
    importlib.reload(config)
    importlib.reload(database)

    expected_db_name = "social_webapp_test"
    assert database.db.name == expected_db_name

def test_developing_db_name(monkeypatch):
    monkeypatch.setenv("ENV_FILE", ".env.dev")
    monkeypatch.setenv("environment", "dev")
    
    importlib.reload(config)
    importlib.reload(database)

    expected_db_name = "social_webapp_dev"
    assert database.db.name == expected_db_name

def test_production_db_name(monkeypatch):
    monkeypatch.setenv("ENV_FILE", ".env.prod")
    monkeypatch.setenv("environment", "prod")
    
    importlib.reload(config)
    importlib.reload(database)

    expected_db_name = "social_webapp_prod"
    assert database.db.name == expected_db_name
