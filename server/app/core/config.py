from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional
import os

# Get which env file to load
env_file = os.getenv("ENV_FILE", ".env.dev")
load_dotenv(env_file)

class Settings(BaseSettings):
    mongodb_username: str
    mongodb_password: str
    secret_key: str
    algorithm: str
    secret_key_refresh: str
    cookie_domain: Optional[str] = None

    model_config = ConfigDict(env_file=env_file)

    @property
    def cookie_config(self):
        is_local = self.cookie_domain in [None, "", "localhost"]
        return {
            "httponly": True,
            "secure": not is_local,
            "samesite": "lax" if is_local else "none",
            "path": "/",
            **({"domain": self.cookie_domain} if self.cookie_domain and not is_local else {}),
        }

settings = Settings()
