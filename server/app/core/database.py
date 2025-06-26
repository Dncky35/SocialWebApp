from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import settings, env_file
from app.models import Account, post
# Build Mongo URI
MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URI)

# Select DB based on env file
if "test" in env_file:
    DB_NAME = "social_webapp_test"
elif "dev" in env_file:
    DB_NAME = "social_webapp_dev"
else:
    DB_NAME = "social_webapp"
    
db = client[DB_NAME]

# Initialization function for Beanie
async def init_db():
    await init_beanie(
        database=db,
        document_models=[Account, post.Post]  # Add all your Beanie models here
    )
