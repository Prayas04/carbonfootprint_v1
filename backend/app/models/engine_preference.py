"""Engine preference model for per-user system settings."""

from sqlalchemy import Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class EnginePreference(Base):
    __tablename__ = "engine_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    background_processing: Mapped[bool] = mapped_column(Boolean, default=True)
    aggressive_optimization: Mapped[bool] = mapped_column(Boolean, default=False)
    verbose_debug: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="engine_preference")
