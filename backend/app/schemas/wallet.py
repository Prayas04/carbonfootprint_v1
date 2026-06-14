"""Wallet schemas for balance, transactions, and green nodes."""

from pydantic import BaseModel


class WalletResponse(BaseModel):
    balance_tco2e: float
    nfc_status: str
    card_id_last4: str

    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    id: int
    date: str
    description: str
    type: str
    type_bg: str
    amount: str
    amount_color: str

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    description: str
    type: str
    amount_tco2e: float


class BurnRatePoint(BaseModel):
    month: str
    value: float


class BurnRateResponse(BaseModel):
    data: list[BurnRatePoint]
    period: str


class GreenNodeResponse(BaseModel):
    id: int
    name: str
    distance: str
    rate: str
    status: str
    status_color: str
    rate_color: str
    active: bool

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    data: list[TransactionResponse]
    total: int
