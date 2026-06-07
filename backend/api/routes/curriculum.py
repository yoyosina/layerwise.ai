from fastapi import APIRouter

router = APIRouter()

import json
import os

def load_curriculum():
    path = os.path.join(os.path.dirname(__file__), '../../curriculum_data.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"modules": []}

@router.get("/modules")
async def get_modules():
    return load_curriculum()

@router.get("/tasks/{day}")
async def get_task_for_day(day: int):
    # Example task
    return {
        "day": day,
        "title": "Vibe Coding Core Concepts",
        "resource": "Andy Carroll Podcast",
        "resource_url": "https://example.com/podcast",
        "duration": "1h 11m",
        "exercise": "Draft a comprehensive PRD for a personal portfolio tracker."
    }

from pydantic import BaseModel
from typing import List

class QuizEvaluationRequest(BaseModel):
    answers: dict[int, int] # mapping of question_id -> selected_option_id

def load_quiz_data(day: int):
    path = os.path.join(os.path.dirname(__file__), '../../quiz_data.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get(str(day), None)
    return None

@router.get("/tasks/{day}/quiz")
async def get_task_quiz(day: int):
    quiz_data = load_quiz_data(day)
    if not quiz_data:
        return {"questions": []}
    
    # Strip out the correct_option_id so the client doesn't see it
    clean_questions = []
    for q in quiz_data["questions"]:
        clean_q = {
            "id": q["id"],
            "text": q["text"],
            "options": q["options"]
        }
        clean_questions.append(clean_q)
        
    return {"questions": clean_questions}

@router.post("/tasks/{day}/quiz/evaluate")
async def evaluate_task_quiz(day: int, request: QuizEvaluationRequest):
    quiz_data = load_quiz_data(day)
    if not quiz_data:
        return {"score": 0, "passed": False, "message": "No quiz available for this day."}
        
    correct_count = 0
    total_questions = len(quiz_data["questions"])
    
    for q in quiz_data["questions"]:
        q_id = q["id"]
        # Convert keys in request.answers if they come as strings
        selected_option = request.answers.get(q_id) or request.answers.get(str(q_id))
        if selected_option == q["correct_option_id"]:
            correct_count += 1
            
    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score >= 75
    
    return {
        "score": score,
        "passed": passed,
        "message": "Congratulations! You passed." if passed else "Please review the lesson and try again."
    }
