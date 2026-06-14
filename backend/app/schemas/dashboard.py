"""Dashboard schemas for aggregated metrics response."""

from pydantic import BaseModel


class TelemetryData(BaseModel):
    tracker_status: str
    gps_precision: str
    sync_rate_hz: float


class BudgetData(BaseModel):
    cycle_name: str
    total_kg: float
    used_kg: float
    remaining_kg: float
    percent_used: float


class RecentEvent(BaseModel):
    icon: str
    mode: str
    distance: str
    duration: str
    impact_kg: float
    positive: bool


class GlobalImpact(BaseModel):
    total_co2e_kg: float
    trend_data: list[float]


class DashboardResponse(BaseModel):
    global_impact: GlobalImpact
    telemetry: TelemetryData
    budget: BudgetData | None
    recent_events: list[RecentEvent]
