from pydantic import ConfigDict, SecretStr
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional
import os

# Get which env file to load
env_file = os.getenv("ENV_FILE", ".env")
load_dotenv(env_file)

class Settings(BaseSettings):
    mongodb_username: str
    mongodb_password: SecretStr
    secret_key: SecretStr
    algorithm: str
    secret_key_refresh: SecretStr
    domain: Optional[str] = None
    environment: str
    google_client_id: SecretStr

    model_config = ConfigDict(env_file=env_file)

    @property
    def cookie_config(self):
        is_local = self.domain in [None, "", "localhost"]
        is_prod = self.domain in ["socialwebapp.cloudrocean.xyz"]

        return {
            "httponly": True,
            "secure": True, # True if not is_development else False, # not is_development,
            "samesite": "lax" if is_local or is_prod else "none",
            "path": "/",
            **({"domain": self.domain} if self.domain and not is_local else {}),
        }

settings = Settings()
