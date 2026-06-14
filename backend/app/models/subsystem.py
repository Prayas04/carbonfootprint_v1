"""Subsystem model for system health monitoring."""

from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Subsystem(Base):
    __tablename__ = "subsystems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    uptime_percent: Mapped[float] = mapped_column(Float, default=100.0)
    status: Mapped[str] = mapped_column(String(20), default="ONLINE")  # ONLINE | DEGRADED | OFFLINE
    confidence_label: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence_value: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence_percent: Mapped[int] = mapped_column(Integer, default=100)
