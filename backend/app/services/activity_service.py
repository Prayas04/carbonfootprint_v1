"""Activity ledger service — transit events CRUD with pagination and filtering."""

import math
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transit_event import TransitEvent
from app.models.user import User
from app.schemas.activity import (
    MetricItem,
    MetricsResponse,
    TransitEventResponse,
    PaginatedEventsResponse,
    PaginationMeta,
)


def _impact_color(impact: float) -> str:
    if impact > 50:
        return "text-error"
    return "text-on-surface"


def _bar_color(impact: float) -> str:
    if impact > 50:
        return "bg-error"
    if impact > 20:
        return "bg-tertiary-fixed-dim"
    return "bg-secondary"


def _bar_width(impact: float, max_impact: float) -> str:
    if max_impact == 0:
        return "0%"
    pct = min(100, int((impact / max_impact) * 100))
    return f"{pct}%"


def _format_duration(minutes: int) -> str:
    h = minutes // 60
    m = minutes % 60
    return f"{h}h {m:02d}m"


def _format_timestamp(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%MZ")


async def get_metrics(db: AsyncSession, user: User) -> MetricsResponse:
    """Get aggregated metrics for the activity page header."""
    user_filter = TransitEvent.user_id == user.id

    # Total emissions (absolute values)
    total_result = await db.execute(
        select(func.sum(func.abs(TransitEvent.impact_kg_co2e))).where(user_filter)
    )
    total_emissions = total_result.scalar() or 0.0

    # Total distance (only for transit modes)
    dist_result = await db.execute(
        select(func.sum(TransitEvent.distance_km)).where(
            and_(user_filter, TransitEvent.mode.in_(["Walk", "Bike", "Transit", "Carpool", "Car", "Flight"]))
        )
    )
    total_distance = dist_result.scalar() or 0.0

    # Total hours
    hours_result = await db.execute(
        select(func.sum(TransitEvent.duration_minutes)).where(user_filter)
    )
    total_minutes = hours_result.scalar() or 0
    total_hours = total_minutes // 60

    # Count distinct modes
    modes_result = await db.execute(
        select(func.count(func.distinct(TransitEvent.mode))).where(user_filter)
    )
    mode_count = modes_result.scalar() or 0

    return MetricsResponse(
        metrics=[
            MetricItem(
                label="Total CO₂",
                icon="co2",
                value=f"{total_emissions:,.0f}",
                unit="kg CO₂",
                trend="-2.4% vs last week",
                trend_icon="arrow_downward",
                trend_color="text-secondary",
            ),
            MetricItem(
                label="Distance Tracked",
                icon="route",
                value=f"{total_distance:,.0f}",
                unit="km",
                trend=f"Across {mode_count} transit modes",
                trend_color="text-on-surface-variant",
            ),
            MetricItem(
                label="Time Active",
                icon="timer",
                value=f"{total_hours:,}",
                unit="hrs",
                trend="Keep it up!",
                trend_icon="trending_up",
                trend_color="text-secondary",
            ),
        ]
    )


async def get_events(
    db: AsyncSession,
    user: User,
    page: int = 1,
    per_page: int = 20,
    date_from: str | None = None,
    date_to: str | None = None,
    mode: str | None = None,
    impact_min: float | None = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
) -> PaginatedEventsResponse:
    """Get paginated, filtered, sorted transit events."""

    filters = [TransitEvent.user_id == user.id]

    if date_from:
        filters.append(TransitEvent.timestamp >= datetime.fromisoformat(date_from))
    if date_to:
        filters.append(TransitEvent.timestamp <= datetime.fromisoformat(date_to))
    if mode:
        filters.append(TransitEvent.mode == mode)
    if impact_min is not None:
        filters.append(func.abs(TransitEvent.impact_kg_co2e) >= impact_min)

    where_clause = and_(*filters)

    # Count total
    count_result = await db.execute(select(func.count(TransitEvent.id)).where(where_clause))
    total_items = count_result.scalar() or 0
    total_pages = max(1, math.ceil(total_items / per_page))

    # Sort
    sort_col = getattr(TransitEvent, sort_by, TransitEvent.timestamp)
    order = sort_col.desc() if sort_order == "desc" else sort_col.asc()

    # Fetch page
    result = await db.execute(
        select(TransitEvent)
        .where(where_clause)
        .order_by(order)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    events = result.scalars().all()

    # Find max impact for bar width calculation
    max_impact = max((abs(e.impact_kg_co2e) for e in events), default=1.0)

    data = []
    for e in events:
        is_transit = e.mode in ["Walk", "Bike", "Transit", "Carpool", "Car", "Flight"]
        
        # Format distance appropriately based on mode
        if is_transit:
            dist_str = f"{e.distance_km} km"
        elif e.mode in ["Vegan", "Vegetarian", "Pescatarian", "Meat"]:
            dist_str = f"{int(e.distance_km)} meals"
        elif e.mode in ["Electricity", "Heating"]:
            dist_str = f"{e.distance_km} kWh"
        elif e.mode in ["Clothing", "Electronics"]:
            dist_str = f"{int(e.distance_km)} items"
        else:
            dist_str = f"{e.distance_km}"

        data.append(
            TransitEventResponse(
                id=e.id,
                timestamp=_format_timestamp(e.timestamp),
                mode_icon=e.mode_icon,
                mode=e.mode,
                origin=e.origin,
                destination=e.destination,
                distance=dist_str,
                duration=_format_duration(e.duration_minutes) if is_transit else "-",
                impact=e.impact_kg_co2e,
                impact_color=_impact_color(abs(e.impact_kg_co2e)),
                bar_color=_bar_color(abs(e.impact_kg_co2e)),
                bar_width=_bar_width(abs(e.impact_kg_co2e), max_impact),
            )
        )

    return PaginatedEventsResponse(
        data=data,
        pagination=PaginationMeta(
            page=page,
            per_page=per_page,
            total_items=total_items,
            total_pages=total_pages,
        ),
    )


async def create_event(db: AsyncSession, user: User, event_data: dict) -> TransitEvent:
    """Create a new transit event."""
    event = TransitEvent(user_id=user.id, **event_data)
    db.add(event)
    await db.flush()
    return event


async def update_event(db: AsyncSession, user: User, event_id: int, event_data: dict) -> TransitEvent | None:
    """Update an existing transit event."""
    result = await db.execute(
        select(TransitEvent).where(
            and_(TransitEvent.id == event_id, TransitEvent.user_id == user.id)
        )
    )
    event = result.scalar_one_or_none()
    if not event:
        return None

    for key, value in event_data.items():
        if value is not None:
            setattr(event, key, value)

    await db.flush()
    return event


async def delete_event(db: AsyncSession, user: User, event_id: int) -> bool:
    """Delete a transit event. Returns True if deleted."""
    result = await db.execute(
        select(TransitEvent).where(
            and_(TransitEvent.id == event_id, TransitEvent.user_id == user.id)
        )
    )
    event = result.scalar_one_or_none()
    if not event:
        return False

    await db.delete(event)
    await db.flush()
    return True
