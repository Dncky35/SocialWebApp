from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from pymongo.errors import PyMongoError
from app.routers.auth import account as auth_account, token as auth_token
from app.routers.profile import account as profile_account
from app.routers.content import posts as content_posts, feed as conten_feed, comment as content_comment
from app.core.config import settings
import logging
from contextlib import asynccontextmanager
from app.core.database import init_db, client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        print("✅ MongoDB initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing MongoDB: {e}")
        raise
    yield
    client.close()
    print("🛑 MongoDB connection closed.")

# FASTAPI api
app = FastAPI(
    lifespan=lifespan,
    title="Social Web App API",
    description="API for the Social Web App",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins_prod = [  # Ensure both Gitpod URLs are included
    "https://cloudrocean.com",
    "https://socialwebapp.cloudrocean.com",
]

origins_dev = [
    "https://3000-dncky35-socialwebapp-09hw3b6xdaz.ws-us121.gitpod.io",
    "https://8000-dncky35-socialwebapp-09hw3b6xdaz.ws-us121.gitpod.io",
    "http://localhost:3000",
    "http://localhost:8000",
]

origins = origins_prod if settings.environment  == "prod" else origins_dev

# Enable CORS securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Restrict origins for security
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Only allow necessary methods
    allow_headers=["Authorization", "Content-Type"],
)

# AUTH ROUTERS
app.include_router(auth_account.router)
app.include_router(auth_token.router)
# PROFILE ROUTERS
app.include_router(profile_account.router)
# CONTENT ROUTERS
app.include_router(conten_feed.router)
app.include_router(content_posts.router)
app.include_router(content_comment.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Social Web App API which updated with CI/CD pipeline 🤘"}

@app.middleware("http")
async def log_request(request:Request, call_next):

    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    return JSONResponse(
        status_code=500,
        content={"message": "Database error occurred!", "details": str(exc)},
    )



