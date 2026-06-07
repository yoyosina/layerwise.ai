from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class StudentProgress(Base):
    __tablename__ = "student_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    current_module_id = Column(Integer, nullable=False, default=1)
    current_day = Column(Integer, nullable=False, default=1)
    
class TestResult(Base):
    __tablename__ = "test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_type = Column(String, nullable=False) # "daily" or "module"
    reference_id = Column(Integer, nullable=False) # day or module_id
    score_percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    wrong_answers_json = Column(String) # JSON string of missed questions/days to revise
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VideoProgress(Base):
    __tablename__ = "video_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, nullable=False)
    progress_seconds = Column(Float, nullable=False, default=0.0)
    duration_seconds = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
