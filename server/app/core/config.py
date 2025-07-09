from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional
import os

# Get which env file to load
env_file = os.getenv("ENV_FILE", ".env")
load_dotenv(env_file)

class Settings(BaseSettings):
    mongodb_username: str
    mongodb_password: str
    secret_key: str
    algorithm: str
    secret_key_refresh: str
    domain: Optional[str] = None
    environment: str

    model_config = ConfigDict(env_file=env_file)

    @property
    def cookie_config(self):
        is_local = self.domain in [None, "", "localhost"]
        is_development = self.environment in ["dev", "development", "test"]

        return {
            "httponly": True,
            "secure": not is_development,
            "samesite": "none", # "lax" if is_local else "none",
            # "path": "/",
            # **({"domain": self.domain} if self.domain and not is_local else {}),
        }

settings = Settings()
