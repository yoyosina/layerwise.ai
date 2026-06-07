import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import get_db
from backend.models.student import StudentProgress, TestResult
from backend.api.dependencies import get_current_user

router = APIRouter()

class QuizSubmission(BaseModel):
    answers: Dict[int, int] # question_id -> selected_option_id

def generate_mock_questions(count: int, prefix: str):
    questions = []
    for i in range(count):
        questions.append({
            "id": i + 1,
            "text": f"{prefix} - Question {i + 1}",
            "options": [
                {"id": 1, "text": "Option A (Correct)"},
                {"id": 2, "text": "Option B"},
                {"id": 3, "text": "Option C"},
                {"id": 4, "text": "Option D"}
            ]
        })
    return questions

@router.get("/daily/{day_id}")
async def get_daily_quiz(day_id: int, current_user_id: int = Depends(get_current_user)):
    # 10 MCQs for the daily quiz
    return {"questions": generate_mock_questions(10, f"Day {day_id}")}

@router.post("/daily/{day_id}/submit")
async def submit_daily_quiz(day_id: int, submission: QuizSubmission, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    # Mock grading: In reality, we'd check DB. 
    # Here, we'll assume option 1 is always correct.
    score = 0
    total = 10
    wrong = []
    for q_id, opt_id in submission.answers.items():
        if opt_id == 1:
            score += 1
        else:
            wrong.append(q_id)
            
    percentage = (score / total) * 100
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
    # 90 MCQs for the module (3 from each of the 30 days)
    return {"questions": generate_mock_questions(90, f"Module {module_id}")}

@router.post("/module/{module_id}/submit")
async def submit_module_quiz(module_id: int, submission: QuizSubmission, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    score = 0
    total = 90
    wrong_summary = {} # map day_id -> list of missed concepts
    
    for q_id, opt_id in submission.answers.items():
        if opt_id == 1:
            score += 1
        else:
            # Map question back to a day (mock mapping: q 1-3 is day 1, etc)
            day_offset = ((int(q_id) - 1) // 3) + 1
            absolute_day = ((module_id - 1) * 30) + day_offset
            if absolute_day not in wrong_summary:
                wrong_summary[absolute_day] = []
            wrong_summary[absolute_day].append(f"Missed Concept {q_id}")
            
    percentage = (score / total) * 100
    passed = percentage >= 70
    
    user_id = current_user_id
    result = TestResult(
        user_id=user_id,
        test_type="module",
        reference_id=module_id,
        score_percentage=percentage,
        passed=passed,
        wrong_answers_json=json.dumps(wrong_summary)
    )
    db.add(result)
    
    if passed:
        prog_res = await db.execute(select(StudentProgress).filter(StudentProgress.user_id == user_id))
        progress = prog_res.scalars().first()
        if progress and progress.current_module_id == module_id:
            progress.current_module_id += 1
            
    await db.commit()
    
    return {
        "score": percentage, 
        "passed": passed, 
        "revision_needed": wrong_summary if not passed else None
    }
