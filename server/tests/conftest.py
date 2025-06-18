import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

from app.main import app
from app.core import database

# Always set test env file before anything
os.environ["ENV_FILE"] = ".env.test"

# Use pytest-asyncio plugin (important in pytest >= 8)
pytest_plugins = ("pytest_asyncio",)

@pytest_asyncio.fixture(scope="function")
async def client():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

@pytest_asyncio.fixture(scope="function")
async def clear_test_db():
    await database.account_collection.delete_many({})
    yield
    await database.account_collection.delete_many({})
