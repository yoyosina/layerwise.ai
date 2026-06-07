from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import get_db
from backend.models.student import StudentProgress, VideoProgress
from backend.api.dependencies import get_current_user
from pydantic import BaseModel

class VideoProgressUpdate(BaseModel):
    task_id: int
    progress_seconds: float
    duration_seconds: float

router = APIRouter()

@router.get("/progress")
async def get_progress(db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user_id = current_user_id
    result = await db.execute(select(StudentProgress).filter(StudentProgress.user_id == user_id))
    progress = result.scalars().first()
    
    if not progress:
        # Create default progress
        progress = StudentProgress(user_id=user_id, current_module_id=1, current_day=1)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
        
    return {
        "current_module_id": progress.current_module_id,
        "current_day": progress.current_day
    }

@router.post("/video-progress")
async def update_video_progress(data: VideoProgressUpdate, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user_id = current_user_id
    result = await db.execute(select(VideoProgress).filter(VideoProgress.user_id == user_id, VideoProgress.task_id == data.task_id))
    progress = result.scalars().first()
    
    if progress:
        progress.progress_seconds = data.progress_seconds
        progress.duration_seconds = data.duration_seconds
    else:
        progress = VideoProgress(
            user_id=user_id,
            task_id=data.task_id,
            progress_seconds=data.progress_seconds,
            duration_seconds=data.duration_seconds
        )
        db.add(progress)
    
    await db.commit()
    return {"status": "success"}

@router.get("/video-progress/{task_id}")
async def get_video_progress_task(task_id: int, db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    result = await db.execute(select(VideoProgress).filter(VideoProgress.user_id == current_user_id, VideoProgress.task_id == task_id))
    progress = result.scalars().first()
    if progress:
        return {"progress_seconds": progress.progress_seconds, "duration_seconds": progress.duration_seconds}
    return {"progress_seconds": 0, "duration_seconds": 0}

@router.get("/video-progress-all")
async def get_all_video_progress(db: AsyncSession = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    result = await db.execute(select(VideoProgress).filter(VideoProgress.user_id == current_user_id))
    progress_list = result.scalars().all()
    return [{"task_id": p.task_id, "progress_seconds": p.progress_seconds, "duration_seconds": p.duration_seconds} for p in progress_list]
