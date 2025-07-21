from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import JSONResponse
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from pymongo.errors import PyMongoError
from app.routers import auth, posts, account, comment
from app.routers.admin import admin_accounts, admin_toggle
from app.core.config import settings
import logging
import os
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

origins = [  # Ensure both Gitpod URLs are included
        "https://cloudrocean.xyz",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cdpn.io",
    ]

# # Enforce HTTPS only in production
# if settings.environment == "production":
#     app.add_middleware(HTTPSRedirectMiddleware)

# Enable CORS securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Restrict origins for security
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Only allow necessary methods
    allow_headers=["Authorization", "Content-Type", "Set-Cookie", "Cookie"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(account.router)
app.include_router(comment.router)
app.include_router(admin_accounts.router)
app.include_router(admin_toggle.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Social Web App API and updated with CI/CD pipeline 🚀"}

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



