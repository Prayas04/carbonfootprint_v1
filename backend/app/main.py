"""CarbonTrack Backend — FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.routers import auth, dashboard, activity, wallet, insights

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    try:
        await create_tables()
    except Exception as e:
        print(f"Failed to create tables during startup: {e}")
    yield


app = FastAPI(
    title="CarbonTrack API",
    description="Backend API for CarbonTrack — personal carbon footprint tracking and reduction.",
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
app.include_router(insights.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "CarbonTrack API", "version": "1.0.0"}
