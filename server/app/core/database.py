from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import settings, env_file
from app.models import account, post, comment

# Build Mongo URI
MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URI)
db = client[f"social_webapp_{settings.environment}"]

# Initialization function for Beanie
async def init_db():
    await init_beanie(
        database=db,
        document_models=[account.Account, post.Post, comment.Comment]  # Add all your Beanie models here
    )
