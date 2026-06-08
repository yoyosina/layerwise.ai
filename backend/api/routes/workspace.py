from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from api.dependencies import get_current_user

import httpx

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str
    language: str

@router.post("/evaluate")
async def evaluate_code(request: CodeExecutionRequest, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    """
    Real execution endpoint using Piston API.
    """
    code = request.code.strip()
    
    if not code:
        return {"status": "error", "output": "No code provided to execute."}
        
    # Map languages to Piston versions
    version_map = {
        "python": "3.10.0",
        "javascript": "18.15.0",
        "typescript": "5.0.3"
    }
    
    piston_lang = request.language.lower()
    if piston_lang not in version_map:
        return {"status": "error", "output": f"Language '{piston_lang}' is not supported by the execution engine."}

    payload = {
        "language": piston_lang,
        "version": version_map[piston_lang],
        "files": [
            {
                "name": f"main.{'py' if piston_lang == 'python' else 'ts' if piston_lang == 'typescript' else 'js'}",
                "content": code
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post("https://emacs.piston.rs/api/v2/execute", json=payload, timeout=10.0)
            data = response.json()
            
            if response.status_code == 200:
                run_result = data.get("run", {})
                output = run_result.get("output", "")
                
                status = "success" if run_result.get("code") == 0 else "error"
                return {"status": status, "output": output}
            else:
                return {"status": "error", "output": f"Compilation Error: {data.get('message', 'Unknown error')}"}
    except Exception as e:
        return {"status": "error", "output": f"Execution Engine Error: {str(e)}"}
