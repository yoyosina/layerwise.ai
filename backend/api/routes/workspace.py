from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from api.dependencies import get_current_user

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str
    language: str

@router.post("/evaluate")
async def evaluate_code(request: CodeExecutionRequest, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    """
    Mock AI Tutor Evaluation Endpoint.
    Later, this can be connected to an LLM API to provide real feedback.
    """
    code = request.code.strip()
    
    if not code:
        return {"status": "error", "feedback": "Please write some code first!", "output": ""}
        
    # Super basic mock evaluation for Python and JS
    if "print" in code or "console.log" in code:
        return {
            "status": "success", 
            "feedback": "Great job! Your code outputs exactly what we expected.", 
            "output": "Hello World!\n(Execution successful)"
        }
    else:
        return {
            "status": "hint", 
            "feedback": "Try using the print() or console.log() function to output a result.", 
            "output": "(No output generated)"
        }
