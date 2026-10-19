from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, videos, analysis, annotations, profile
from .database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Surgical Education Platform API",
    description="API for AI-powered surgical education platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/v1/videos", tags=["Videos"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(annotations.router, prefix="/api/v1/annotations", tags=["Annotations"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["Profile"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Welcome to the Surgical Education Platform API"}
