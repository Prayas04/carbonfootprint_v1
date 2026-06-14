"""Activity ledger schemas for transit events and metrics."""

from datetime import datetime
from pydantic import BaseModel


class MetricItem(BaseModel):
    label: str
    icon: str
    value: str
    unit: str
    trend: str
    trend_icon: str | None = None
    trend_color: str


class MetricsResponse(BaseModel):
    metrics: list[MetricItem]


class TransitEventResponse(BaseModel):
    id: int
    timestamp: str
    mode_icon: str
    mode: str
    origin: str
    destination: str
    distance: str
    duration: str
    impact: float
    impact_color: str
    bar_color: str
    bar_width: str

    model_config = {"from_attributes": True}


class TransitEventCreate(BaseModel):
    timestamp: datetime
    mode: str
    mode_icon: str
    origin: str
    destination: str
    distance_km: float
    duration_minutes: int
    impact_kg_co2e: float


class TransitEventUpdate(BaseModel):
    timestamp: datetime | None = None
    mode: str | None = None
    mode_icon: str | None = None
    origin: str | None = None
    destination: str | None = None
    distance_km: float | None = None
    duration_minutes: int | None = None
    impact_kg_co2e: float | None = None


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total_items: int
    total_pages: int


class PaginatedEventsResponse(BaseModel):
    data: list[TransitEventResponse]
    pagination: PaginationMeta
