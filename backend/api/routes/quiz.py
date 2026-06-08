import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from database import get_db
from models.student import StudentProgress, TestResult
from models.curriculum import Task, QuizQuestion, QuizOption
from api.dependencies import get_current_user

router = APIRouter()

class QuizSubmission(BaseModel):
    answers: Dict[int, int] # question_id -> selected_option_id

@router.get("/daily/{day_id}")
async def get_daily_quiz(day_id: int, current_user_id: int = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    t_result = await db.execute(select(Task).where(Task.day == day_id))
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

@router.post("/daily/{day_id}/submit")
async def submit_daily_quiz(day_id: int, submission: QuizSubmission, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    t_result = await db.execute(select(Task).where(Task.day == day_id))
    task = t_result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.task_id == task.id))
    questions = q_result.scalars().all()
    total = len(questions)
    if total == 0:
        return {"score": 0, "passed": False, "wrong_answers": []}
        
    score = 0
    wrong = []
    
    for q in questions:
        selected_option_id = submission.answers.get(q.id) or submission.answers.get(str(q.id))
        if selected_option_id:
            opt_result = await db.execute(
                select(QuizOption).where(QuizOption.id == int(selected_option_id), QuizOption.question_id == q.id)
            )
            opt = opt_result.scalars().first()
            if opt and opt.is_correct:
                score += 1
            else:
                wrong.append(q.id)
        else:
            wrong.append(q.id)
            
    percentage = (score / total) * 100 if total > 0 else 0
    passed = percentage >= 75
    
    # Save result
    user_id = current_user_id
    result = TestResult(
        user_id=user_id,
        test_type="daily",
        reference_id=day_id,
        score_percentage=percentage,
        passed=passed,
        wrong_answers_json=json.dumps(wrong)
    )
    db.add(result)
    
    if passed:
        # Update progress
        prog_res = await db.execute(select(StudentProgress).filter(StudentProgress.user_id == user_id))
        progress = prog_res.scalars().first()
        if progress and progress.current_day == day_id:
            progress.current_day += 1
            if progress.current_day > progress.current_module_id * 30:
                pass # Reached module end, must take module test
            
    await db.commit()
    return {"score": percentage, "passed": passed, "wrong_answers": wrong}

@router.get("/module/{module_id}")
async def get_module_quiz(module_id: int, current_user_id: int = Depends(get_current_user)):
    # To be implemented with DB
    return {"questions": []}

@router.post("/module/{module_id}/submit")
async def submit_module_quiz(module_id: int, submission: QuizSubmission, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    return {
        "score": 0, 
        "passed": False, 
        "revision_needed": None
    }
