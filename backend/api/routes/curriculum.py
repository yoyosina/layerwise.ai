from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from database import get_db
from models.curriculum import Module, Task, Resource, QuizQuestion, QuizOption

router = APIRouter()

@router.get("/modules")
async def get_modules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Module).options(selectinload(Module.tasks)).order_by(Module.order))
    modules = result.scalars().all()
    
    output_modules = []
    for m in modules:
        tasks = []
        sorted_tasks = sorted(m.tasks, key=lambda t: t.day)
        for t in sorted_tasks:
            tasks.append({
                "id": t.id,
                "title": t.title,
                "day": t.day
            })
            
        output_modules.append({
            "id": m.id,
            "title": m.title,
            "order": m.order,
            "tasks": tasks
        })
        
    return {"modules": output_modules}

@router.get("/tasks/{day}")
async def get_task_for_day(day: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.day == day).options(selectinload(Task.resources)))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    resource_url = ""
    if task.resources:
        resource_url = task.resources[0].url
        
    return {
        "day": task.day,
        "title": task.title,
        "resource": "Required Video/Reading",
        "resource_url": resource_url,
        "duration": "1h",
        "exercise": "Review the concepts and proceed to the daily quiz."
    }

class QuizEvaluationRequest(BaseModel):
    answers: dict[int, int] # mapping of question_id -> selected_option_id

@router.get("/tasks/{day}/quiz")
async def get_task_quiz(day: int, db: AsyncSession = Depends(get_db)):
    t_result = await db.execute(select(Task).where(Task.day == day))
    task = t_result.scalars().first()
    if not task:
        return {"questions": []}
        
    q_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.task_id == task.id).options(selectinload(QuizQuestion.options))
    )
    questions = q_result.scalars().all()
    
    clean_questions = []
    for q in questions:
        options = [{"id": opt.id, "text": opt.option_text} for opt in q.options]
        clean_questions.append({
            "id": q.id,
            "text": q.question_text,
            "options": options
        })
        
    return {"questions": clean_questions}

@router.post("/tasks/{day}/quiz/evaluate")
async def evaluate_task_quiz(day: int, request: QuizEvaluationRequest, db: AsyncSession = Depends(get_db)):
    t_result = await db.execute(select(Task).where(Task.day == day))
    task = t_result.scalars().first()
    if not task:
        return {"score": 0, "passed": False, "message": "No quiz available for this day."}
        
    q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.task_id == task.id))
    questions = q_result.scalars().all()
    total_questions = len(questions)
    if total_questions == 0:
        return {"score": 0, "passed": False, "message": "No quiz available for this day."}
        
    correct_count = 0
    
    for q in questions:
        selected_option_id = request.answers.get(q.id) or request.answers.get(str(q.id))
        if selected_option_id:
            opt_result = await db.execute(
                select(QuizOption).where(QuizOption.id == int(selected_option_id), QuizOption.question_id == q.id)
            )
            opt = opt_result.scalars().first()
            if opt and opt.is_correct:
                correct_count += 1
                
    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score >= 75
    
    return {
        "score": score,
        "passed": passed,
        "message": "Congratulations! You passed." if passed else "Please review the lesson and try again."
    }
