"""Insights service — generates personalized carbon reduction tips, challenges, and achievements."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transit_event import TransitEvent
from app.models.user import User
from app.schemas.insights import InsightItem, InsightsResponse


async def get_insights(db: AsyncSession, user: User) -> InsightsResponse:
    """Generate personalized insights based on user's activity data."""

    # --- Aggregate user's data ---
    total_result = await db.execute(
        select(func.sum(TransitEvent.impact_kg_co2e)).where(TransitEvent.user_id == user.id)
    )
    total_co2 = abs(total_result.scalar() or 0.0)

    # Count activities by mode
    mode_counts_result = await db.execute(
        select(TransitEvent.mode, func.count(TransitEvent.id))
        .where(TransitEvent.user_id == user.id)
        .group_by(TransitEvent.mode)
    )
    mode_counts = dict(mode_counts_result.tuples().all())

    # Total green activities (bike, walk)
    green_modes = {"Bike", "Walk", "E-Bike"}
    green_count = sum(mode_counts.get(m, 0) for m in green_modes)
    car_count = mode_counts.get("Car", 0)
    total_activities = sum(mode_counts.values()) if mode_counts else 0

    # Total savings from green modes
    savings_result = await db.execute(
        select(func.sum(func.abs(TransitEvent.impact_kg_co2e)))
        .where(TransitEvent.user_id == user.id, TransitEvent.impact_kg_co2e < 0)
    )
    total_savings = savings_result.scalar() or 0.0

    # --- Today's Insight (personalized based on data) ---
    if green_count > car_count and total_activities > 0:
        today = InsightItem(
            title="You're doing amazing! 🌟",
            description=f"You've chosen green transport {green_count} times — that's more than car trips! "
                        f"You've already offset {total_savings:.1f} kg CO₂. Keep biking and walking to stay ahead!",
            icon="celebration",
            type="tip",
            impact_kg=total_savings,
        )
    elif car_count > 0:
        today = InsightItem(
            title="Small swaps, big impact 💡",
            description=f"You took {car_count} car trips recently. Switching just 2 of those to the bus could "
                        f"save about {car_count * 1.5:.1f} kg CO₂ — that's like planting a small tree!",
            icon="swap_horiz",
            type="tip",
            impact_kg=car_count * 1.5,
        )
    else:
        today = InsightItem(
            title="Start your green journey! 🌱",
            description="Log your first activity to get personalized insights and tips on reducing your carbon footprint.",
            icon="lightbulb",
            type="tip",
            impact_kg=0,
        )

    # --- Weekly Challenges ---
    challenges = [
        InsightItem(
            title="🚴 Bike to Work Challenge",
            description="Bike instead of driving for 3 days this week. Could save up to 8 kg CO₂!",
            icon="pedal_bike",
            type="challenge",
            impact_kg=8.0,
        ),
        InsightItem(
            title="🥗 Meatless Monday",
            description="Skip meat for one day — a plant-based day saves roughly 3.5 kg CO₂.",
            icon="restaurant",
            type="challenge",
            impact_kg=3.5,
        ),
        InsightItem(
            title="⚡ Energy Saver",
            description="Unplug unused electronics and switch off lights for a day. Save ~2 kg CO₂.",
            icon="power_settings_new",
            type="challenge",
            impact_kg=2.0,
        ),
    ]

    # --- Achievements (based on real data) ---
    achievements = []
    if total_activities >= 5:
        achievements.append(InsightItem(
            title="🏅 First Steps",
            description=f"You've logged {total_activities} activities! You're building a great habit.",
            icon="military_tech",
            type="achievement",
            impact_kg=None,
        ))
    if green_count >= 3:
        achievements.append(InsightItem(
            title="🌿 Green Champion",
            description=f"You've taken {green_count} eco-friendly trips. The planet thanks you!",
            icon="eco",
            type="achievement",
            impact_kg=total_savings,
        ))
    if total_savings >= 10:
        achievements.append(InsightItem(
            title="🌳 Tree Planter",
            description=f"You've saved {total_savings:.1f} kg CO₂ — equivalent to a young tree absorbing CO₂ for a year!",
            icon="park",
            type="achievement",
            impact_kg=total_savings,
        ))
    if not achievements:
        achievements.append(InsightItem(
            title="🎯 Getting Started",
            description="Log more activities to unlock achievements! You're just getting started.",
            icon="flag",
            type="achievement",
            impact_kg=None,
        ))

    # --- Impact Equivalences ---
    equivalences = []
    if total_co2 > 0:
        trees = total_co2 / 21.0  # A tree absorbs ~21 kg CO2/year
        phone_charges = total_co2 / 0.008  # ~8g CO2 per phone charge
        km_driven = total_co2 / 0.21  # ~210g CO2 per km driven

        equivalences = [
            InsightItem(
                title=f"🌳 {trees:.1f} Trees",
                description=f"Your {total_co2:.0f} kg CO₂ footprint equals what {trees:.1f} trees absorb in a year.",
                icon="park",
                type="equivalence",
                impact_kg=total_co2,
            ),
            InsightItem(
                title=f"📱 {phone_charges:,.0f} Phone Charges",
                description=f"Your footprint could charge a smartphone {phone_charges:,.0f} times.",
                icon="smartphone",
                type="equivalence",
                impact_kg=total_co2,
            ),
            InsightItem(
                title=f"🚗 {km_driven:,.0f} km Driven",
                description=f"That's like driving a car {km_driven:,.0f} km — roughly the distance from Delhi to Mumbai and back!",
                icon="directions_car",
                type="equivalence",
                impact_kg=total_co2,
            ),
        ]

    return InsightsResponse(
        today_insight=today,
        challenges=challenges,
        achievements=achievements,
        equivalences=equivalences,
    )
