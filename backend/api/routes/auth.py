from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, Field
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from models.student import StudentProgress
from core.config import settings
import jwt
import requests
from datetime import datetime, timedelta
from typing import Optional
from api.dependencies import get_current_user

router = APIRouter()

CLIENT_ID = "317193772618-b7bdlts6kj58jrku9lpc1kf903j7duan.apps.googleusercontent.com"

class TokenData(BaseModel):
    id_token: str = ""
    access_token: str = ""

class OnboardData(BaseModel):
    name: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

@router.post("/login")
async def login(data: TokenData, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        email = None
        name = ""
        
        if data.id_token:
            idinfo = id_token.verify_oauth2_token(data.id_token, google_requests.Request(), CLIENT_ID)
            email = idinfo.get('email')
            name = idinfo.get('name', '')
        elif data.access_token:
            resp = requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={data.access_token}")
            if resp.status_code != 200:
                raise ValueError("Invalid access token")
            user_info = resp.json()
            email = user_info.get("email")
            name = user_info.get("name", "")
        else:
            raise HTTPException(status_code=400, detail="No token provided")
            
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        is_new_user = False
        if not user:
            is_new_user = True
            user = User(email=email, name=name)
            db.add(user)
            await db.flush()
            
            progress = StudentProgress(user_id=user.id, current_module_id=1, current_day=1)
            db.add(progress)
            await db.commit()
            await db.refresh(user)

        jwt_token = create_access_token({"sub": str(user.id)})
        
        response.set_cookie(
            key="access_token",
            value=f"Bearer {jwt_token}",
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=30*24*60*60
        )

        return {
            "message": "User logged in successfully", 
            "token": jwt_token, # Keep it for React Native mobile app fallback
            "is_new_user": is_new_user,
            "user": {"id": user.id, "email": user.email, "name": user.name}
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

@router.put("/onboard")
async def onboard(data: OnboardData, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.id == current_user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = data.name
    await db.commit()
    
    return {"message": "Onboarding complete"}
