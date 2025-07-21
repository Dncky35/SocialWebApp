import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport
from app.core.config import settings
from app.main import app
from app.models.account import Account
from app.models.post import Post
from app.models.comment import Comment
from beanie import init_beanie


@pytest_asyncio.fixture
async def db_client():
    MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
    client = AsyncIOMotorClient(MONGO_URI)
    yield client
    client.close()


@pytest_asyncio.fixture
async def db(db_client: AsyncIOMotorClient):
    db_name = "social_webapp_test"
    test_db = db_client.get_database(name=db_name)

    await init_beanie(
        database=test_db,
        document_models=[Account, Post, Comment]
    )

    yield test_db

    for model in [Account, Post, Comment]:
        await model.get_motor_collection().delete_many({})


@pytest_asyncio.fixture
async def client(db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def logged_client(client: AsyncClient, db):
    # Step 1: Register a new account
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepassword",
        "full_name": "Test User"
    }

    response = await client.post("/auth/signup", data=register_data)
    assert response.status_code == 200

    # Step 3: Extract cookies and manually set them in client headers
    cookies = response.cookies

    # Set cookies into the client
    client.cookies.set("refreshToken", cookies.get("refreshToken"))

    response = await client.post("/auth/create_access_token")
    assert response.status_code == 200
    assert response.json()["detail"] == "Access token refreshed/Created."

    client.cookies.set("accessToken", cookies.get("accessToken"))

    return client