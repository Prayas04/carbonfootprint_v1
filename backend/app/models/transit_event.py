"""Transit event model for activity ledger tracking."""

from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class TransitEvent(Base):
    __tablename__ = "transit_events"
    __table_args__ = (
        Index("ix_transit_events_user_timestamp", "user_id", "timestamp"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    mode: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # Freight | Fleet | Courier | Transit
    mode_icon: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # Material icon name
    origin: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    impact_kg_co2e: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # Positive=emission, Negative=offset
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="transit_events")
