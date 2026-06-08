from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, curriculum, admin, student, quiz, workspace
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from init_db import init_models

limiter = Limiter(key_func=get_remote_address, default_limits=["50/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database tables on startup (especially for ephemeral Render disk)
    await init_models()
    yield

app = FastAPI(title="Layerwise.ai Backend API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "https://layerwise-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(curriculum.router, prefix="/api/curriculum", tags=["curriculum"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])

@app.get("/")
async def root():
    return {"message": "Welcome to Layerwise.ai API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
