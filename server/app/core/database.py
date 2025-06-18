from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import settings, env_file
from app.models import Account  # Your Beanie model

# Build Mongo URI
MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URI)

# Select DB based on env file
DB_NAME = "social_webapp_test" if "test" in env_file else "social_webapp"
db = client[DB_NAME]

# Initialization function for Beanie
async def init_db():
    await init_beanie(
        database=db,
        document_models=[Account]
    )
