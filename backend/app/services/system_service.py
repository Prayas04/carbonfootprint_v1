"""System status service — subsystem health, endpoints, preferences, and logs."""

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subsystem import Subsystem
from app.models.engine_preference import EnginePreference
from app.models.user import User
from app.schemas.system import (
    SubsystemResponse,
    EndpointStatus,
    PreferencesResponse,
    LogEntry,
)


# Status color mapping
STATUS_COLORS = {
    "ONLINE": "secondary",
    "DEGRADED": "tertiary-fixed-dim",
    "OFFLINE": "error",
}

CONFIDENCE_COLORS = {
    "secondary": "text-secondary",
    "primary-container": "text-primary-container",
    "tertiary-fixed-dim": "text-tertiary-fixed-dim",
    "error": "text-error",
}


async def get_subsystems(db: AsyncSession) -> list[SubsystemResponse]:
    """Get all subsystem health statuses."""
    result = await db.execute(select(Subsystem))
    subsystems = result.scalars().all()

    data = []
    for sys in subsystems:
        status_color = STATUS_COLORS.get(sys.status, "secondary")
        # Determine confidence color based on percentage
        if sys.confidence_percent >= 90:
            conf_color = "text-secondary"
            bar_color = "bg-secondary"
        elif sys.confidence_percent >= 80:
            conf_color = "text-primary-container"
            bar_color = "bg-primary-container"
        else:
            conf_color = "text-tertiary-fixed-dim"
            bar_color = "bg-tertiary-fixed-dim"

        data.append(
            SubsystemResponse(
                icon=sys.icon,
                name=sys.name,
                uptime=f"{sys.uptime_percent}%",
                status_label=sys.status,
                status_color=status_color,
                confidence_label=sys.confidence_label,
                confidence_value=sys.confidence_value,
                confidence_color=conf_color,
                bar_color=bar_color,
                bar_width=f"{sys.confidence_percent}%",
                accent_bg=f"bg-{status_color}/5",
            )
        )
    return data


def get_endpoint_statuses() -> list[EndpointStatus]:
    """Return current API endpoint telemetry (simulated)."""
    return [
        EndpointStatus(
            path="/api/v2/telemetry/ingest",
            status="200 OK",
            status_color="secondary",
            latency="42ms",
            volume="1,240",
        ),
        EndpointStatus(
            path="/api/v2/climatiq/estimate",
            status="200 OK",
            status_color="secondary",
            latency="118ms",
            volume="452",
        ),
        EndpointStatus(
            path="/api/v2/auth/verify",
            status="429 Rate Lim",
            status_color="tertiary-fixed-dim",
            latency="8ms",
            volume="5,102",
            highlight=True,
        ),
        EndpointStatus(
            path="/api/v2/user/profile",
            status="200 OK",
            status_color="secondary",
            latency="65ms",
            volume="89",
        ),
    ]


async def get_preferences(db: AsyncSession, user: User) -> PreferencesResponse:
    """Get the user's engine preferences."""
    result = await db.execute(
        select(EnginePreference).where(EnginePreference.user_id == user.id)
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        return PreferencesResponse(
            background_processing=True,
            aggressive_optimization=False,
            verbose_debug=True,
        )

    return PreferencesResponse(
        background_processing=prefs.background_processing,
        aggressive_optimization=prefs.aggressive_optimization,
        verbose_debug=prefs.verbose_debug,
    )


async def update_preferences(db: AsyncSession, user: User, prefs_data: dict) -> PreferencesResponse:
    """Update the user's engine preferences."""
    result = await db.execute(
        select(EnginePreference).where(EnginePreference.user_id == user.id)
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        prefs = EnginePreference(user_id=user.id)
        db.add(prefs)

    for key, value in prefs_data.items():
        if value is not None:
            setattr(prefs, key, value)

    await db.flush()

    return PreferencesResponse(
        background_processing=prefs.background_processing,
        aggressive_optimization=prefs.aggressive_optimization,
        verbose_debug=prefs.verbose_debug,
    )


def get_log_entries() -> list[LogEntry]:
    """Return simulated live event stream entries."""
    now = datetime.now(timezone.utc)
    base_hour = now.hour
    base_min = now.minute

    def t(offset_sec: int) -> str:
        s = base_min * 60 + offset_sec
        m = (s // 60) % 60
        sec = s % 60
        return f"{base_hour:02d}:{m:02d}:{sec:02d}"

    return [
        LogEntry(time=t(0), level="[INFO]", level_color="text-primary-container", msg="Initializing batch sync process..."),
        LogEntry(time=t(1), level="[INFO]", level_color="text-primary-container", msg="Compiled 42 offline activity segments."),
        LogEntry(time=t(2), level="[WARN]", level_color="text-tertiary-fixed-dim", msg="Segment ID 89x_A missing GPS precision data. Using fallback estimation."),
        LogEntry(time=t(3), level="[INFO]", level_color="text-primary-container", msg="Connecting to Climatiq API endpoint..."),
        LogEntry(time=t(4), level="[OK]", level_color="text-secondary", msg="Handshake successful. Latency 118ms."),
        LogEntry(time=t(5), level="[INFO]", level_color="text-primary-container", msg="Uploading payload (1.2MB)..."),
        LogEntry(time=t(7), level="[OK]", level_color="text-secondary", msg="Calculated 14.2kg CO2e for batch."),
        LogEntry(time=t(8), level="[INFO]", level_color="text-primary-container", msg="Updating local ledger and clearing cache."),
        LogEntry(time=t(9), level="[INFO]", level_color="text-primary-container", msg="Awaiting next event...", cursor=True),
    ]
