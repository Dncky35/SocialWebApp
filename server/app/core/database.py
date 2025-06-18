from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings, env_file
from beanie import init_beanie

MONGO_URI = f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)

# Get DB name directly from env file (loaded by config.py)
DB_NAME = env_file  # Use env file name to separate databases

# Map file name to DB name (you can improve this later if you want)
database_name = "social_webapp_test" if "test"in DB_NAME else "social_webapp"
db = client[database_name]
account_collection = db["accounts"]

# Helper Function to Convert MongoDB Data
def serialize_document(doc) -> dict:
    return {**doc, "id": str(doc["_id"])} if doc else None

# Async init function to call on app startup
async def init_db():
    # Initialize Beanie with Motor client, database and document models
    await init_beanie(database=db, document_models=[AccountModel])