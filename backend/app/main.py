"""CarbonTrack Backend — FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.routers import auth, dashboard, activity, wallet, system

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    await create_tables()
    yield


app = FastAPI(
    title="CarbonTrack API",
    description="Backend API for the CarbonTrack Enterprise Console — carbon footprint tracking and management.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(activity.router)
app.include_router(wallet.router)
app.include_router(system.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "CarbonTrack API", "version": "1.0.0"}
