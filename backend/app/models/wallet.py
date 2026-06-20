"""Wallet model for carbon credit account."""

from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=False
    )
    balance_tco2e: Mapped[float] = mapped_column(Float, default=0.0)
    nfc_status: Mapped[str] = mapped_column(
        String(20), default="Active"
    )  # Active | Inactive
    card_id_last4: Mapped[str] = mapped_column(String(4), default="0000")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship(
        "Transaction", back_populates="wallet", cascade="all, delete-orphan"
    )
