from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
from dotenv import load_dotenv
import os

# Load correct env file before anything else
env_file = os.getenv("ENV_FILE", ".env.dev")
load_dotenv(env_file)

MONGO_URI=f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)

# 🧪 allow test override
DB_NAME = os.getenv("DB_NAME")
db = client[DB_NAME]
account_collection = db["accounts"]

# Helper Function to Convert MongoDB Data
def serialize_document(doc) -> dict:
    return {**doc, "id": str(doc["_id"])} if doc else None