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

# Load test environment variables.
# It's good practice to use a dedicated .env file for testing (e.g., .env.test)
# to avoid conflicts with development or production configurations.
env_file = os.getenv("ENV_FILE", ".env.test")
load_dotenv(env_file)

# Use a dedicated test database name to isolate tests
TEST_DB_NAME = f"test_social_webapp_{settings.environment}"


@pytest.fixture(scope="function")
def event_loop():
    """
    Creates an instance of the default event loop for the whole session.
    This is necessary for async fixtures with a scope higher than 'function'.
    """
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def db_client(event_loop):
    """
    Creates a MongoDB client for the test session.
    This client is created only once per test run, improving efficiency.
    """
    mongodb_url = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
    client = AsyncIOMotorClient(mongodb_url)
    yield client
    client.close()


@pytest.fixture(scope="function")
async def db(db_client: AsyncIOMotorClient):
    """
    Provides a test database that is clean for each test function.
    Initializes Beanie with the test database.
    The entire database is dropped after each test to ensure isolation.
    """
    test_db = db_client[TEST_DB_NAME]
    await init_beanie(database=test_db, document_models=[Account])

    yield test_db

    # Clean up the database after the test
    await db_client.drop_database(TEST_DB_NAME)


@pytest.fixture(scope="function")
async def client(db):
    """
    Provides an async test client for making requests to the application.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
