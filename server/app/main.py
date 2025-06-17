from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from .routers import auth
import os

# FASTAPI api
app = FastAPI()

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
    allow_origins=["*"],  # Restrict origins for security
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
    print(f"Request Report:")
    print(f"\nRequest:\n{request.method}, url: {request.url}")
    print(f"\nRequest Headers: {request.headers}")
    response = await call_next(request)
    print(f"\nResponse headers:\n{response.headers}")
    return response