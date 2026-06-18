"""Insights router — personalized carbon reduction tips and challenges."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.insights import InsightsResponse
from app.services.insights_service import get_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("", response_model=InsightsResponse)
async def insights_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized carbon reduction insights, challenges, and achievements."""
    return await get_insights(db, current_user)
