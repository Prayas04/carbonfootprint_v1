"""Dashboard service — aggregates data from multiple models."""

import random
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transit_event import TransitEvent
from app.models.budget import Budget
from app.models.user import User
from app.schemas.dashboard import (
    DashboardResponse,
    GlobalImpact,
    TelemetryData,
    BudgetData,
    RecentEvent,
)


def _format_duration(minutes: int) -> str:
    if minutes >= 60:
        h = minutes // 60
        m = minutes % 60
        return f"{h}h {m}m" if m else f"{h}h"
    return f"{minutes} min"


async def get_dashboard_data(db: AsyncSession, user: User) -> DashboardResponse:
    """Build the full dashboard response for a user."""

    # --- Global Impact ---
    result = await db.execute(
        select(func.sum(TransitEvent.impact_kg_co2e)).where(TransitEvent.user_id == user.id)
    )
    total_co2e = result.scalar() or 0.0

    # Generate sparkline trend data (simulated 30-day points)
    trend_data = []
    val = abs(total_co2e) * 0.3
    for _ in range(30):
        val += random.uniform(-50, 30)
        trend_data.append(round(max(0, val), 1))

    # --- Telemetry (simulated real-time) ---
    telemetry = TelemetryData(
        tracker_status="Active",
        gps_precision="2.4m",
        sync_rate_hz=1.2,
    )

    # --- Active Budget ---
    budget_result = await db.execute(
        select(Budget)
        .where(Budget.user_id == user.id)
        .order_by(Budget.end_date.desc())
        .limit(1)
    )
    budget_row = budget_result.scalar_one_or_none()
    budget = None
    if budget_row:
        budget = BudgetData(
            cycle_name=budget_row.cycle_name,
            total_kg=budget_row.total_kg,
            used_kg=budget_row.used_kg,
            remaining_kg=budget_row.remaining_kg,
            percent_used=budget_row.percent_used,
        )

    # --- Recent Events (last 5) ---
    events_result = await db.execute(
        select(TransitEvent)
        .where(TransitEvent.user_id == user.id)
        .order_by(TransitEvent.timestamp.desc())
        .limit(5)
    )
    events = events_result.scalars().all()

    recent_events = []
    for e in events:
        recent_events.append(
            RecentEvent(
                icon=e.mode_icon,
                mode=e.mode,
                distance=f"{e.distance_km} km",
                duration=_format_duration(e.duration_minutes),
                impact_kg=e.impact_kg_co2e,
                positive=e.impact_kg_co2e < 0,  # Negative = offset = positive impact
            )
        )

    return DashboardResponse(
        global_impact=GlobalImpact(total_co2e_kg=round(total_co2e, 1), trend_data=trend_data),
        telemetry=telemetry,
        budget=budget,
        recent_events=recent_events,
    )
