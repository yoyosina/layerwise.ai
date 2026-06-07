import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Likewise.ai"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./likewise.db")
    SECRET_KEY: str = "super-secret-likewise-key-change-in-prod"
    # For local development without Docker, we will use Qdrant local mode (memory/disk) and skip Redis
    
    class Config:
        env_file = ".env"

settings = Settings()
