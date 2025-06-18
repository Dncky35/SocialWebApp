import pytest
from app.core import database

@pytest.mark.asyncio
async def test_init_db_calls_init_beanie(patch_motor_client_and_init_beanie):
    mock_client, mock_init_beanie = patch_motor_client_and_init_beanie
    
    await database.init_db()
    
    # Assert init_beanie called exactly once
    mock_init_beanie.assert_awaited_once()
    
    # Check that init_beanie was called with correct arguments
    called_args, called_kwargs = mock_init_beanie.call_args
    
    # database param should be the same as database.db
    assert called_kwargs.get("database") == database.db
    
    # document_models param should include your Account model (by name check)
    assert any("Account" in str(model) for model in called_kwargs.get("document_models", []))
