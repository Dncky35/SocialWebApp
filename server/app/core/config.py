from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

class Settings(BaseSettings):
    mongodb_username:str
    mongodb_password:str
    secret_key:str
    algorithm:str
    secret_key_refresh:str
    cookie_domain:str

    class Config:
        env_file=".env"

    @property
    def cookie_config(self):
        is_local = self.cookie_domain in [None, "", "localhost"]
        return{
            "httponly": True,
            "secure": not is_local,
            "samesite": "lax" if is_local else "none",
            "path":"/",
            **({"domain":self.cookie_domain} if self.cookie_domain and not is_local else {}),
        }

settings = Settings()