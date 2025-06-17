from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

MONGO_URI=f"mongodb+srv://{settings.mongodb_username}:{settings.mongodb_password}@cluster0.yu7sul0.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client["social_webapp"]
account_collection = db["accounts"]

# Helper Function to Convert MongoDB Data
def serialize_document(doc) -> dict:
    return {**doc, "id": str(doc["_id"])} if doc else None