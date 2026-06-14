"""System status schemas for health, endpoints, preferences, and logs."""

from pydantic import BaseModel


class SubsystemResponse(BaseModel):
    icon: str
    name: str
    uptime: str
    status_label: str
    status_color: str
    confidence_label: str
    confidence_value: str
    confidence_color: str
    bar_color: str
    bar_width: str
    accent_bg: str

    model_config = {"from_attributes": True}


class EndpointStatus(BaseModel):
    path: str
    status: str
    status_color: str
    latency: str
    volume: str
    highlight: bool = False


class PreferencesResponse(BaseModel):
    background_processing: bool
    aggressive_optimization: bool
    verbose_debug: bool

    model_config = {"from_attributes": True}


class PreferencesUpdate(BaseModel):
    background_processing: bool | None = None
    aggressive_optimization: bool | None = None
    verbose_debug: bool | None = None


class LogEntry(BaseModel):
    time: str
    level: str
    level_color: str
    msg: str
    cursor: bool = False


class SystemStatusResponse(BaseModel):
    subsystems: list[SubsystemResponse]
    endpoints: list[EndpointStatus]
    logs: list[LogEntry]
