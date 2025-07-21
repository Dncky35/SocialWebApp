import os
import pytest
from beanie import init_beanie
from dotenv import load_dotenv
from httpx import AsyncClient, ASGITransport
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.main import app
from app.models.account import Account
from app.models.post import Post
from app.models.comment import Comment

# The `event_loop` fixture is no longer needed with modern pytest-asyncio.
# pytest-asyncio manages the event loop automatically.


@pytest.fixture(scope="session")
async def db_client():
    """
    Creates a MongoDB client for the test session.
    This client is created only once per test run, improving efficiency.
    It uses the DATABASE_URL from the test environment configuration.
    """
    # This URI is also defined in app/core/database.py. Consider centralizing it
    # in a `database_url` property in the Settings class for consistency.
    MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
    client = AsyncIOMotorClient(MONGO_URI)
    yield client
    client.close()


@pytest.fixture(scope="function")
async def db(db_client: AsyncIOMotorClient):
    """
    Provides a test database that is clean for each test function.
    Initializes Beanie with the test database and all application models.
    The entire database is dropped after each test to ensure isolation.
    """
    # Explicitly get the test database by name. The name is constructed based
    # on the environment, which should be 'test' for integration tests.
    db_name = f"social_webapp_test"
    test_db = db_client.get_database(name=db_name)

    print(f"✅ Using DB: {db.name}")
    # Add all your Beanie Document models here to ensure they are initialized
    # for every test. This prevents errors when tests interact with different
    # parts of your application.
    document_models = [
        Account,
        Post,
        Comment,
    ]
    await init_beanie(database=test_db, document_models=document_models)

    yield test_db

    # Clean up by deleting all documents from each collection instead of
    # dropping the database. This avoids permission issues on cloud-hosted
    # MongoDB instances (like the 'dropDatabase' action).
    for model in document_models:
        await model.get_motor_collection().delete_many({})


@pytest.fixture(scope="function")
async def client(db):
    """
    Provides an async test client for making requests to the application.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
