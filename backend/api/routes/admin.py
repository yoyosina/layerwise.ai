from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class AdminLogin(BaseModel):
    username: str
    password: str

@router.post("/login")
async def admin_login(credentials: AdminLogin):
    # Mocking admin login for local testing based on user's preference
    if credentials.username == "admin" and credentials.password == "password":
        return {"token": "mock-admin-jwt-token"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.get("/metrics")
async def get_metrics():
    # Mocked metrics derived from the database logic
    return {
        "active_users_24h": 42,
        "new_users_7d": 12,
        "total_modules": 3,
        "total_tasks": 15
    }

class ResourceCreate(BaseModel):
    type: str
    url: str
    title: str

class TaskCreate(BaseModel):
    title: str
    day: int
    resources: list[ResourceCreate]

class ModuleCreate(BaseModel):
    title: str
    order: int
    tasks: list[TaskCreate]

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

@router.post("/modules")
async def create_module(module: ModuleCreate):
    return {"message": "Module created successfully", "module": {"id": 4, "title": module.title, "order": module.order}}

class ModuleUpdate(BaseModel):
    title: str

@router.put("/modules/{module_id}")
async def update_module(module_id: int, module_update: ModuleUpdate):
    return {"message": "Module updated successfully", "module_id": module_id, "title": module_update.title}

@router.delete("/modules/{module_id}")
async def delete_module(module_id: int):
    return {"message": "Module deleted successfully", "module_id": module_id}
