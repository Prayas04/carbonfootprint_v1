"""Activity ledger router — transit events CRUD with filtering."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.activity import (
    MetricsResponse,
    PaginatedEventsResponse,
    TransitEventCreate,
    TransitEventUpdate,
)
from app.services.activity_service import (
    get_metrics,
    get_events,
    create_event,
    update_event,
    delete_event,
)

router = APIRouter(prefix="/api/activity", tags=["Activity Ledger"])


@router.get("/metrics", response_model=MetricsResponse)
async def activity_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated activity metrics (totals, distance, hours)."""
    return await get_metrics(db, current_user)


@router.get("/events", response_model=PaginatedEventsResponse)
async def list_events(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    mode: str | None = Query(None),
    impact_min: float | None = Query(None),
    sort_by: str = Query("timestamp"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated transit events with optional filtering and sorting."""
    return await get_events(
        db, current_user, page, per_page, date_from, date_to, mode, impact_min, sort_by, sort_order
    )


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_transit_event(
    data: TransitEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new transit event."""
    event = await create_event(db, current_user, data.model_dump())
    return {"id": event.id, "message": "Event created successfully"}


@router.put("/events/{event_id}")
async def update_transit_event(
    event_id: int,
    data: TransitEventUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing transit event."""
    event = await update_event(db, current_user, event_id, data.model_dump(exclude_unset=True))
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return {"id": event.id, "message": "Event updated successfully"}


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transit_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a transit event."""
    deleted = await delete_event(db, current_user, event_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
