from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, curriculum, admin, student, quiz

app = FastAPI(title="Layerwise.ai Backend API")

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

@app.get("/")
async def root():
    return {"message": "Welcome to Layerwise.ai API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
