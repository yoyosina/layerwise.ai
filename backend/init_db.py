import asyncio
from database import engine, Base
from models.user import User
from models.curriculum import Module, Task, Resource, QuizQuestion, QuizOption
from models.student import StudentProgress, TestResult, VideoProgress

async def init_models():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created/updated successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())
