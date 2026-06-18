"""Insights schemas for personalized tips, challenges, and achievements."""

from pydantic import BaseModel


class InsightItem(BaseModel):
    title: str
    description: str
    icon: str
    type: str  # tip | achievement | challenge | equivalence
    impact_kg: float | None = None


class InsightsResponse(BaseModel):
    today_insight: InsightItem
    challenges: list[InsightItem]
    achievements: list[InsightItem]
    equivalences: list[InsightItem]
