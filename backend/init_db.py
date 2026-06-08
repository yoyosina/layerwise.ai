import asyncio
import json
import os
from sqlalchemy import select
from database import engine, Base, AsyncSessionLocal
from models.user import User
from models.curriculum import Module, Task, Resource, QuizQuestion, QuizOption
from models.student import StudentProgress, TestResult, VideoProgress

async def seed_data(session):
    result = await session.execute(select(Module))
    if result.scalars().first() is not None:
        return
        
    print("Seeding database from JSON files...")
    curr_path = os.path.join(os.path.dirname(__file__), 'curriculum_data.json')
    quiz_path = os.path.join(os.path.dirname(__file__), 'quiz_data.json')
    
    if os.path.exists(curr_path):
        with open(curr_path, 'r', encoding='utf-8') as f:
            curr_data = json.load(f)
            for m in curr_data.get('modules', []):
                new_module = Module(
                    id=m['id'],
                    title=m['title'],
                    order=m['order']
                )
                session.add(new_module)
                
                for t in m.get('tasks', []):
                    new_task = Task(
                        id=t['id'],
                        module_id=new_module.id,
                        title=t['title'],
                        day=t['day']
                    )
                    session.add(new_task)
                    
                    if 'resource_link' in t:
                        new_resource = Resource(
                            task_id=new_task.id,
                            type='link',
                            url=t['resource_link'],
                            title="Resource"
                        )
                        session.add(new_resource)
        await session.commit()
                        
    if os.path.exists(quiz_path):
        with open(quiz_path, 'r', encoding='utf-8') as f:
            quiz_data = json.load(f)
            for day_str, daily_quiz in quiz_data.items():
                day = int(day_str)
                t_result = await session.execute(select(Task).where(Task.day == day))
                task = t_result.scalars().first()
                if not task:
                    continue
                    
                for q in daily_quiz.get('questions', []):
                    new_question = QuizQuestion(
                        task_id=task.id,
                        question_text=q['text']
                    )
                    session.add(new_question)
                    await session.flush()
                    
                    for opt in q.get('options', []):
                        new_opt = QuizOption(
                            question_id=new_question.id,
                            option_text=opt['text'],
                            is_correct=(opt['id'] == q['correct_option_id'])
                        )
                        session.add(new_opt)
        await session.commit()
    print("Database seeded successfully.")

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created/updated successfully!")
    
    async with AsyncSessionLocal() as session:
        await seed_data(session)

if __name__ == "__main__":
    asyncio.run(init_models())
