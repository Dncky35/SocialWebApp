import os
import asyncio
import pytest
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.models.account import Account
from app.core.config import settings

# Load test environment
env_file = os.getenv("ENV_FILE", ".env.test")
load_dotenv(env_file)

@pytest.fixture(scope="function")
async def real_beanie():
    mongodb_url = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
    test_client = AsyncIOMotorClient(mongodb_url)
    test_db = test_client["social_webapp_test"]

    # Initialize Beanie
    await init_beanie(database=test_db, document_models=[Account])

    # Cleanup collections before each test
    await test_db["accounts"].delete_many({})  # Adjust collection name if needed

    yield

    test_client.close()

@pytest.fixture(scope="function")
async def client(real_beanie):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
