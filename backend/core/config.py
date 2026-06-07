import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Layerwise.ai"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./layerwise.db")
    SECRET_KEY: str = "super-secret-layerwise-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    # For local development without Docker, we will use Qdrant local mode (memory/disk) and skip Redis
    
    class Config:
        env_file = ".env"

settings = Settings()
