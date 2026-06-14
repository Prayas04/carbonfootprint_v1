"""Budget model for carbon allowance cycle tracking."""

from datetime import date, datetime, timezone
from sqlalchemy import String, Date, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cycle_name: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "MAY CYCLE"
    total_kg: Mapped[float] = mapped_column(Float, nullable=False)
    used_kg: Mapped[float] = mapped_column(Float, default=0.0)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="budgets")

    @property
    def remaining_kg(self) -> float:
        return self.total_kg - self.used_kg

    @property
    def percent_used(self) -> float:
        if self.total_kg == 0:
            return 0.0
        return round((self.used_kg / self.total_kg) * 100, 1)
