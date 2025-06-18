from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from .routers import auth
import logging
import os
from contextlib import asynccontextmanager
from app.core.database import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # call your existing init_db function
    app.state.mongo_client = client  # store client if you want to access later
    yield
    client.close()

# FASTAPI api
app = FastAPI(
    lifespan=lifespan,
    title="Social Web App API",
    description="API for the Social Web App",
    version="1.0.0",
)

origins = [  # Ensure both Gitpod URLs are included
        "https://cloudrocean.xyz",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://3000-dncky35-reacttraining-k8wikratnfd.ws-us119.gitpod.io",
        "https://8000-dncky35-reacttraining-k8wikratnfd.ws-us119.gitpod.io",
    ]

# Enforce HTTPS only in production
if os.getenv("ENV") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# Enable CORS securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Restrict origins for security
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Only allow necessary methods
    allow_headers=["Authorization", "Content-Type", "Set-Cookie", "Cookie"],
)

app.include_router(auth.router)

@app.get("/")
async def root():
    return { "Message" : "Welcome Home Social Web App"}

@app.middleware("http")
async def log_request(request:Request, call_next):
    # print(f"Request Report:")
    # print(f"\nRequest:\n{request.method}, url: {request.url}")
    # print(f"\nRequest Headers: {request.headers}")
    # response = await call_next(request)
    # print(f"\nResponse headers:\n{response.headers}")

    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    return JSONResponse(
        status_code=500,
        content={"message": "Database error occurred", "details": str(exc)},
    )
