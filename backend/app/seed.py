"""Database seeding script — populates realistic personal demo data."""

import asyncio
from datetime import datetime, date, timezone, timedelta
from app.database import AsyncSessionLocal, create_tables
from app.models import (
    User, TransitEvent, Wallet, Transaction, GreenNode, Budget,
)
from app.middleware.auth import hash_password


async def seed():
    """Seed the database with personal demo data."""
    await create_tables()

    async with AsyncSessionLocal() as db:
        # ── Check if already seeded ──
        from sqlalchemy import select
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        # ── 1. Create demo user ──
        user = User(
            email="demo@carbontrack.io",
            hashed_password=hash_password("password123"),
            full_name="Alex Rivera",
            role="user",
        )
        db.add(user)
        await db.flush()
        print(f"[OK] Created user: {user.email} (id={user.id})")

        # ── 2. Create wallet (EcoPoints) ──
        wallet = Wallet(
            user_id=user.id,
            balance_tco2e=850.0,  # EcoPoints
            nfc_status="Active",
            card_id_last4="8901",
        )
        db.add(wallet)
        await db.flush()
        print(f"[OK] Created wallet with balance: {wallet.balance_tco2e} EcoPoints")

        # ── 3. Create transactions (rewards history) ──
        transactions = [
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 15, tzinfo=timezone.utc), description="🚴 5-day bike streak bonus!", type="Achievement", amount_tco2e=50.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 12, tzinfo=timezone.utc), description="🎯 Monthly carbon goal achieved", type="Bonus", amount_tco2e=100.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 10, tzinfo=timezone.utc), description="🥗 Meatless Monday challenge done", type="Challenge Complete", amount_tco2e=25.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 8, tzinfo=timezone.utc), description="🚶 Walked to work 3 days", type="Achievement", amount_tco2e=30.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 5, tzinfo=timezone.utc), description="🌱 First week streak!", type="Bonus", amount_tco2e=75.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 3, tzinfo=timezone.utc), description="⚡ Energy saver challenge done", type="Challenge Complete", amount_tco2e=20.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 6, 1, tzinfo=timezone.utc), description="🚌 Public transit week bonus", type="Bonus", amount_tco2e=40.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 5, 28, tzinfo=timezone.utc), description="🏅 Signed up for CarbonTrack", type="Achievement", amount_tco2e=10.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 5, 25, tzinfo=timezone.utc), description="🚴 Weekend bike ride bonus", type="Bonus", amount_tco2e=35.00),
            Transaction(wallet_id=wallet.id, date=datetime(2026, 5, 20, tzinfo=timezone.utc), description="🌳 Planted a tree challenge", type="Challenge Complete", amount_tco2e=50.00),
        ]
        db.add_all(transactions)
        print(f"[OK] Created {len(transactions)} reward transactions")

        # ── 4. Create transit events (personal activities) ──
        base_time = datetime(2026, 6, 10, 7, 30, tzinfo=timezone.utc)
        events_data = [
            {"mode": "Car", "mode_icon": "directions_car", "origin": "Home", "destination": "Office", "distance_km": 12.5, "duration_minutes": 25, "impact_kg_co2e": 2.8},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Gym", "distance_km": 3.2, "duration_minutes": 12, "impact_kg_co2e": -1.2},
            {"mode": "Bus", "mode_icon": "directions_bus", "origin": "Home", "destination": "Shopping Mall", "distance_km": 8.0, "duration_minutes": 30, "impact_kg_co2e": 0.9},
            {"mode": "Walk", "mode_icon": "directions_walk", "origin": "Home", "destination": "Park", "distance_km": 1.5, "duration_minutes": 20, "impact_kg_co2e": -0.5},
            {"mode": "Train", "mode_icon": "train", "origin": "Suburb Station", "destination": "City Center", "distance_km": 22.0, "duration_minutes": 35, "impact_kg_co2e": 1.5},
            {"mode": "Car", "mode_icon": "directions_car", "origin": "Office", "destination": "Client Meeting", "distance_km": 18.0, "duration_minutes": 30, "impact_kg_co2e": 4.1},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Office", "distance_km": 12.5, "duration_minutes": 35, "impact_kg_co2e": -3.1},
            {"mode": "Bus", "mode_icon": "directions_bus", "origin": "Office", "destination": "Home", "distance_km": 12.5, "duration_minutes": 40, "impact_kg_co2e": 1.2},
            {"mode": "Walk", "mode_icon": "directions_walk", "origin": "Office", "destination": "Lunch Spot", "distance_km": 0.8, "duration_minutes": 10, "impact_kg_co2e": -0.3},
            {"mode": "Flight", "mode_icon": "flight", "origin": "Delhi", "destination": "Mumbai", "distance_km": 1400.0, "duration_minutes": 150, "impact_kg_co2e": 180.0},
            {"mode": "Car", "mode_icon": "directions_car", "origin": "Home", "destination": "Grocery Store", "distance_km": 5.0, "duration_minutes": 15, "impact_kg_co2e": 1.1},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Friend's House", "distance_km": 4.5, "duration_minutes": 18, "impact_kg_co2e": -1.8},
            {"mode": "Train", "mode_icon": "train", "origin": "City Center", "destination": "Airport", "distance_km": 35.0, "duration_minutes": 45, "impact_kg_co2e": 2.1},
            {"mode": "Walk", "mode_icon": "directions_walk", "origin": "Hotel", "destination": "Conference Center", "distance_km": 2.0, "duration_minutes": 25, "impact_kg_co2e": -0.7},
            {"mode": "Bus", "mode_icon": "directions_bus", "origin": "Airport", "destination": "Hotel", "distance_km": 15.0, "duration_minutes": 35, "impact_kg_co2e": 1.4},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Library", "distance_km": 2.8, "duration_minutes": 10, "impact_kg_co2e": -1.0},
            {"mode": "Car", "mode_icon": "directions_car", "origin": "Home", "destination": "Hospital", "distance_km": 8.5, "duration_minutes": 20, "impact_kg_co2e": 1.9},
            {"mode": "Walk", "mode_icon": "directions_walk", "origin": "Home", "destination": "Café", "distance_km": 0.5, "duration_minutes": 7, "impact_kg_co2e": -0.2},
            {"mode": "Bus", "mode_icon": "directions_bus", "origin": "Home", "destination": "University", "distance_km": 10.0, "duration_minutes": 25, "impact_kg_co2e": 1.0},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Riverside Trail", "distance_km": 8.0, "duration_minutes": 25, "impact_kg_co2e": -2.5},
            {"mode": "Car", "mode_icon": "directions_car", "origin": "Home", "destination": "Parent's House", "distance_km": 45.0, "duration_minutes": 55, "impact_kg_co2e": 10.2},
            {"mode": "Train", "mode_icon": "train", "origin": "Home Station", "destination": "Beach Town", "distance_km": 80.0, "duration_minutes": 90, "impact_kg_co2e": 4.8},
            {"mode": "Walk", "mode_icon": "directions_walk", "origin": "Beach", "destination": "Restaurant", "distance_km": 1.0, "duration_minutes": 12, "impact_kg_co2e": -0.4},
            {"mode": "Bike", "mode_icon": "pedal_bike", "origin": "Home", "destination": "Yoga Studio", "distance_km": 2.0, "duration_minutes": 8, "impact_kg_co2e": -0.8},
            {"mode": "Bus", "mode_icon": "directions_bus", "origin": "Market", "destination": "Home", "distance_km": 6.0, "duration_minutes": 20, "impact_kg_co2e": 0.7},
        ]

        for i, data in enumerate(events_data):
            event = TransitEvent(
                user_id=user.id,
                timestamp=base_time + timedelta(hours=i * 4, minutes=i * 11),
                **data,
            )
            db.add(event)
        print(f"[OK] Created {len(events_data)} personal activities")

        # ── 5. Create budget (monthly carbon goal) ──
        budget = Budget(
            user_id=user.id,
            cycle_name="JUNE 2026",
            total_kg=300,
            used_kg=185,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 30),
        )
        db.add(budget)
        print("[OK] Created monthly carbon goal (JUNE 2026)")

        # ── 6. Create green nodes (nearby green spots) ──
        green_nodes = [
            GreenNode(name="Central Park", distance_km=0.8, rate_tco2e_per_day=3, status="Active", latitude=28.6139, longitude=77.2090),
            GreenNode(name="City Bike Station", distance_km=1.5, rate_tco2e_per_day=8, status="Active", latitude=28.6280, longitude=77.2190),
            GreenNode(name="Community Recycling Center", distance_km=3.2, rate_tco2e_per_day=5, status="Active", latitude=28.6350, longitude=77.2250),
            GreenNode(name="Riverside Nature Trail", distance_km=5.5, rate_tco2e_per_day=2, status="Offline", latitude=28.6450, longitude=77.2350),
        ]
        db.add_all(green_nodes)
        print(f"[OK] Created {len(green_nodes)} nearby green spots")

        await db.commit()
        print("\nDatabase seeded successfully!")
        print("Login: demo@carbontrack.io / password123")


if __name__ == "__main__":
    asyncio.run(seed())
