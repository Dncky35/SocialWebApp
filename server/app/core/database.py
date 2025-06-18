from motor.motor_asyncio import AsyncIOMotorClient
<<<<<<< HEAD
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
=======
from beanie import init_beanie
from .config import settings, env_file
from app.models import Account  # Your Beanie model

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
    
>>>>>>> fc9d4fbf5c28c7390bd8938996ef85765761f038
db = client[DB_NAME]

# Initialization function for Beanie
async def init_db():
    await init_beanie(
        database=db,
        document_models=[Account]
    )
