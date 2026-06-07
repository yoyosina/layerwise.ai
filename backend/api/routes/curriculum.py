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

@router.get("/tasks/{day}/quiz")
async def get_task_quiz(day: int):
    # Mock returning 10 questions for a task
    questions = []
    for i in range(1, 11):
        questions.append({
            "id": i,
            "text": f"Sample Question {i} for Day {day}?",
            "options": [
                {"id": 1, "text": "Option A"},
                {"id": 2, "text": "Option B"},
                {"id": 3, "text": "Option C"},
                {"id": 4, "text": "Option D"}
            ]
        })
    return {"questions": questions}

@router.post("/tasks/{day}/quiz/evaluate")
async def evaluate_task_quiz(day: int, request: QuizEvaluationRequest):
    # Mock evaluation logic
    score = 80 # mock passing score
    passed = score >= 75
    return {
        "score": score,
        "passed": passed,
        "message": "Congratulations! You passed." if passed else "Please review the lesson and try again."
    }
