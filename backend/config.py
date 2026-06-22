import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bharat_twin.db"
    MAPBOX_ACCESS_TOKEN: str = "pk.placeholder_mapbox_token"
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Allow loading from .env file if it exists
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
