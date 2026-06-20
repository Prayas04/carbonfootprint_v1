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
    DailyInsight,
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

    # --- Daily Insight (personalized) ---
    # Count green activities (negative impact = offset)
    green_result = await db.execute(
        select(func.count(TransitEvent.id))
        .where(TransitEvent.user_id == user.id, TransitEvent.impact_kg_co2e < 0)
    )
    green_count = green_result.scalar() or 0

    # Total savings
    savings_result = await db.execute(
        select(func.sum(func.abs(TransitEvent.impact_kg_co2e)))
        .where(TransitEvent.user_id == user.id, TransitEvent.impact_kg_co2e < 0)
    )
    total_savings = savings_result.scalar() or 0.0

    # Generate insight message based on data
    insights = [
        f"Great job! You've made {green_count} eco-friendly trips, saving {total_savings:.1f} kg CO₂. That's like planting {total_savings / 21:.0f} small trees! 🌱",
        f"You saved {total_savings:.1f} kg CO₂ through green choices! Try biking to work tomorrow for even more impact. 🚴",
        f"Your green trips have offset {total_savings:.1f} kg of emissions — keep the momentum going this week! 💪",
    ]
    message = random.choice(insights) if total_savings > 0 else "Log your first green activity (bike, walk, or bus) to start getting personalized insights! 🌍"

    daily_insight = DailyInsight(
        message=message,
        icon="eco" if total_savings > 0 else "lightbulb",
        streak_days=min(green_count, 14),  # Cap at 14 for display
        co2_saved_today=round(total_savings * 0.1, 1) if total_savings > 0 else 0,  # Simulated daily portion
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

        recent_events.append(
            RecentEvent(
                icon=e.mode_icon,
                mode=e.mode,
                distance=dist_str,
                duration=_format_duration(e.duration_minutes) if is_transit else "-",
                impact_kg=e.impact_kg_co2e,
                positive=e.impact_kg_co2e < 0,  # Negative = offset = positive impact
            )
        )

    return DashboardResponse(
        global_impact=GlobalImpact(total_co2e_kg=round(total_co2e, 1), trend_data=trend_data),
        daily_insight=daily_insight,
        budget=budget,
        recent_events=recent_events,
    )
