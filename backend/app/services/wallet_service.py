"""Wallet service — balance, transactions, burn rate, and green nodes."""

from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.green_node import GreenNode
from app.models.user import User
from app.schemas.wallet import (
    WalletResponse,
    TransactionResponse,
    TransactionListResponse,
    BurnRateResponse,
    BurnRatePoint,
    GreenNodeResponse,
)


# Mapping transaction type → badge styling (matches frontend classes)
TYPE_STYLES = {
    "Settlement": {
        "bg": "bg-surface-container-highest text-on-surface",
        "amount_color": "text-error",
    },
    "Credit": {"bg": "bg-primary/10 text-primary", "amount_color": "text-secondary"},
    "Bonus": {"bg": "bg-secondary/10 text-secondary", "amount_color": "text-secondary"},
    "Pending": {
        "bg": "bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim",
        "amount_color": "text-tertiary-fixed-dim",
    },
}


async def get_wallet(db: AsyncSession, user: User) -> WalletResponse:
    """Get the user's wallet balance and card info."""
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        return WalletResponse(
            balance_tco2e=0.0, nfc_status="Inactive", card_id_last4="0000"
        )

    return WalletResponse(
        balance_tco2e=wallet.balance_tco2e,
        nfc_status=wallet.nfc_status,
        card_id_last4=wallet.card_id_last4,
    )


async def get_transactions(db: AsyncSession, user: User) -> TransactionListResponse:
    """Get all transactions for the user's wallet."""
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        return TransactionListResponse(data=[], total=0)

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.wallet_id == wallet.id)
        .order_by(Transaction.date.desc())
    )
    transactions = tx_result.scalars().all()

    data = []
    for tx in transactions:
        style = TYPE_STYLES.get(tx.type, TYPE_STYLES["Settlement"])
        amount_str = (
            f"+{tx.amount_tco2e:,.2f}"
            if tx.amount_tco2e > 0
            else f"{tx.amount_tco2e:,.2f}"
        )
        data.append(
            TransactionResponse(
                id=tx.id,
                date=tx.date.strftime("%b %d, %Y"),
                description=tx.description,
                type=tx.type,
                type_bg=style["bg"],
                amount=amount_str,
                amount_color=style["amount_color"],
            )
        )

    return TransactionListResponse(data=data, total=len(data))


async def create_transaction(
    db: AsyncSession, user: User, tx_data: dict
) -> Transaction:
    """Create a new transaction and update wallet balance."""
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()

    if not wallet:
        raise ValueError("Wallet not found")

    tx = Transaction(
        wallet_id=wallet.id,
        date=datetime.utcnow(),
        description=tx_data["description"],
        type=tx_data["type"],
        amount_tco2e=tx_data["amount_tco2e"],
    )
    db.add(tx)

    # Update wallet balance
    wallet.balance_tco2e += tx_data["amount_tco2e"]
    await db.flush()
    return tx


async def get_burn_rate(db: AsyncSession, user: User) -> BurnRateResponse:
    """Get burn rate analytics data for the chart."""
    # Simulated monthly burn data
    months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    values = [8200, 7800, 9100, 8500, 7200, 6800, 7500, 8900, 9500, 10200, 11000, 12450]

    return BurnRateResponse(
        data=[BurnRatePoint(month=m, value=v) for m, v in zip(months, values)],
        period="YTD 2024",
    )


async def get_green_nodes(db: AsyncSession) -> list[GreenNodeResponse]:
    """Get all geofenced green nodes."""
    result = await db.execute(select(GreenNode).order_by(GreenNode.distance_km))
    nodes = result.scalars().all()

    data = []
    for n in nodes:
        is_active = n.status == "Active"
        data.append(
            GreenNodeResponse(
                id=n.id,
                name=n.name,
                distance=f"{n.distance_km} km away",
                rate=f"+{n.rate_tco2e_per_day} tCO2e/day",
                status=n.status,
                status_color="text-on-surface-variant" if is_active else "text-error",
                rate_color="text-secondary" if is_active else "text-on-surface-variant",
                active=is_active,
            )
        )
    return data
