import sys
from pathlib import Path

# Ensure backend directory is in sys.path when launched from repository root
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import movies, users, recommendations
from app.database import Base, engine
from app.models.user import User


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="VYORA Recommendation API",
    description="Reel Vibe Movie Recommendation & Discovery Engine API",
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(
    movies.router,
    prefix="/api/movies",
    tags=["Movies"]
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["Users"]
)

app.include_router(
    recommendations.router,
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Movie Recommendation Backend is running!"
    }
