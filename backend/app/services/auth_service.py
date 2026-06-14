"""Authentication service for user registration and login."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.wallet import Wallet
from app.models.engine_preference import EnginePreference
from app.middleware.auth import hash_password, verify_password, create_access_token, create_refresh_token


async def register_user(db: AsyncSession, email: str, password: str, full_name: str) -> User:
    """Register a new user with wallet and engine preferences."""
    # Check existing
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role="viewer",
    )
    db.add(user)
    await db.flush()  # Get the user.id

    # Create associated wallet
    wallet = Wallet(user_id=user.id, balance_tco2e=0.0, card_id_last4="0000")
    db.add(wallet)

    # Create default engine preferences
    prefs = EnginePreference(user_id=user.id)
    db.add(prefs)

    await db.flush()
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> dict | None:
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        return None

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


async def refresh_access_token(db: AsyncSession, payload: dict) -> dict | None:
    """Generate new access token from a valid refresh token payload."""
    user_id = payload.get("sub")
    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        return None

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }
