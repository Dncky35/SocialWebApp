import os
import asyncio
import pytest
import motor.motor_asyncio
from app.main import app
from app.models.account import Account
from app.core.config import settings
from beanie import init_beanie
from httpx import AsyncClient, ASGITransport

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def real_beanie():
    # Build MongoDB URI with credentials from config
    mongodb_url = f"mongodb://{settings.mongodb_username}:{settings.mongodb_password}@localhost:27017"

    test_client = motor.motor_asyncio.AsyncIOMotorClient(mongodb_url)
    test_db = test_client[settings.db_name]

    await init_beanie(database=test_db, document_models=[Account])

    yield

    await test_client.drop_database(settings.db_name)
    test_client.close()

@pytest.fixture(scope="function")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
