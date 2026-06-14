"""Wallet router — balance, transactions, burn rate, green nodes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.wallet import (
    WalletResponse,
    TransactionListResponse,
    TransactionCreate,
    BurnRateResponse,
    GreenNodeResponse,
)
from app.services.wallet_service import (
    get_wallet,
    get_transactions,
    create_transaction,
    get_burn_rate,
    get_green_nodes,
)

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])


@router.get("", response_model=WalletResponse)
async def wallet_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get wallet balance and card details."""
    return await get_wallet(db, current_user)


@router.get("/transactions", response_model=TransactionListResponse)
async def wallet_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all wallet transactions."""
    return await get_transactions(db, current_user)


@router.post("/transactions", status_code=status.HTTP_201_CREATED)
async def add_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new wallet transaction."""
    try:
        tx = await create_transaction(db, current_user, data.model_dump())
        return {"id": tx.id, "message": "Transaction created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/burn-rate", response_model=BurnRateResponse)
async def burn_rate(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get burn rate analytics data for chart display."""
    return await get_burn_rate(db, current_user)


@router.get("/green-nodes", response_model=list[GreenNodeResponse])
async def green_nodes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all geofenced green nodes."""
    return await get_green_nodes(db)
