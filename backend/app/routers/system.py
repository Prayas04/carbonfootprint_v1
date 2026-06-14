"""System status router — health, endpoints, preferences, logs."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.system import (
    SubsystemResponse,
    EndpointStatus,
    PreferencesResponse,
    PreferencesUpdate,
    LogEntry,
    SystemStatusResponse,
)
from app.services.system_service import (
    get_subsystems,
    get_endpoint_statuses,
    get_preferences,
    update_preferences,
    get_log_entries,
)

router = APIRouter(prefix="/api/system", tags=["System Status"])


@router.get("", response_model=SystemStatusResponse)
async def system_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full system status overview (subsystems + endpoints + logs)."""
    subsystems = await get_subsystems(db)
    endpoints = get_endpoint_statuses()
    logs = get_log_entries()
    return SystemStatusResponse(subsystems=subsystems, endpoints=endpoints, logs=logs)


@router.get("/subsystems", response_model=list[SubsystemResponse])
async def list_subsystems(db: AsyncSession = Depends(get_db)):
    """Get all subsystem health statuses."""
    return await get_subsystems(db)


@router.get("/endpoints", response_model=list[EndpointStatus])
async def list_endpoints():
    """Get API endpoint telemetry data."""
    return get_endpoint_statuses()


@router.get("/preferences", response_model=PreferencesResponse)
async def get_prefs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's engine preferences."""
    return await get_preferences(db, current_user)


@router.put("/preferences", response_model=PreferencesResponse)
async def update_prefs(
    data: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update engine preferences."""
    return await update_preferences(db, current_user, data.model_dump(exclude_unset=True))


@router.get("/logs", response_model=list[LogEntry])
async def list_logs():
    """Get recent event stream log entries."""
    return get_log_entries()
