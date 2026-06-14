"""Green node model for geofenced carbon offset sources."""

from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class GreenNode(Base):
    __tablename__ = "green_nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    rate_tco2e_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Active")  # Active | Offline
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
