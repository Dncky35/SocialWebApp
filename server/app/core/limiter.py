from slowapi import Limiter
from slowapi.util import get_remote_address
from redis import Redis
from limits.storage import RedisStorage

# Connect to Redis (Default local setup)
redis_client = Redis(host="localhost", port=6379, decode_responses=True)

# Use Redis-based storage for rate limits
storage = RedisStorage("redis://localhost:6379")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri = "redis://localhost:6379",
    default_limits=["100/minute"] # GLOBAL fallback limit here
)