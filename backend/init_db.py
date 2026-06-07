import asyncio
from backend.database import engine, Base
from backend.models.user import User
from backend.models.curriculum import Module, Task, Resource, QuizQuestion, QuizOption
from backend.models.student import StudentProgress, TestResult, VideoProgress

async def init_models():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created/updated successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())
