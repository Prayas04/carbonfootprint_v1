"""Database seeding script — populates realistic demo data."""

import asyncio
from datetime import datetime, date, timezone, timedelta
from app.database import AsyncSessionLocal, create_tables
from app.models import (
    User, TransitEvent, Wallet, Transaction, GreenNode, Budget, Subsystem, EnginePreference,
)
from app.middleware.auth import hash_password


async def seed():
    """Seed the database with demo data."""
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
            role="admin",
        )
        db.add(user)
        await db.flush()
        print(f"[OK] Created user: {user.email} (id={user.id})")

        # ── 2. Create wallet ──
        wallet = Wallet(
            user_id=user.id,
            balance_tco2e=12450.0,
            nfc_status="Active",
            card_id_last4="8901",
        )
        db.add(wallet)
        await db.flush()
        print(f"[OK] Created wallet with balance: {wallet.balance_tco2e} tCO2e")

        # ── 3. Create transactions ──
        transactions = [
            Transaction(wallet_id=wallet.id, date=datetime(2024, 10, 12, tzinfo=timezone.utc), description="Factory A Emissions Offset", type="Settlement", amount_tco2e=-450.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 10, 10, tzinfo=timezone.utc), description="Q4 Allowance Deposit", type="Credit", amount_tco2e=5000.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 10, 5, tzinfo=timezone.utc), description="Green Bonus: Logistics Hub", type="Bonus", amount_tco2e=120.50),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 10, 1, tzinfo=timezone.utc), description="Pending Solar Credit", type="Pending", amount_tco2e=85.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 28, tzinfo=timezone.utc), description="Warehouse B Carbon Tax", type="Settlement", amount_tco2e=-320.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 25, tzinfo=timezone.utc), description="Fleet EV Conversion Rebate", type="Credit", amount_tco2e=2500.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 20, tzinfo=timezone.utc), description="Solar Farm Partnership", type="Bonus", amount_tco2e=340.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 15, tzinfo=timezone.utc), description="Q3 Compliance Settlement", type="Settlement", amount_tco2e=-1200.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 10, tzinfo=timezone.utc), description="Wind Energy Credit", type="Credit", amount_tco2e=800.00),
            Transaction(wallet_id=wallet.id, date=datetime(2024, 9, 5, tzinfo=timezone.utc), description="Pending Reforestation Credit", type="Pending", amount_tco2e=450.00),
        ]
        db.add_all(transactions)
        print(f"[OK] Created {len(transactions)} transactions")

        # ── 4. Create transit events ──
        base_time = datetime(2023, 10, 7, 8, 0, tzinfo=timezone.utc)
        events_data = [
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "Port of Seattle", "destination": "Spokane Dist. Center", "distance_km": 452, "duration_minutes": 270, "impact_kg_co2e": 145.2},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "Downtown HQ", "destination": "Bellevue Campus", "distance_km": 18, "duration_minutes": 45, "impact_kg_co2e": 12.4},
            {"mode": "Courier", "mode_icon": "two_wheeler", "origin": "Fulfillment Ctr A", "destination": "Customer Loc #842", "distance_km": 5.2, "duration_minutes": 18, "impact_kg_co2e": 2.1},
            {"mode": "Transit", "mode_icon": "train", "origin": "Chicago Hub", "destination": "Denver Depot", "distance_km": 1610, "duration_minutes": 1100, "impact_kg_co2e": 84.5},
            {"mode": "Commuter Rail", "mode_icon": "train", "origin": "Union Station", "destination": "Suburban Terminal", "distance_km": 24.5, "duration_minutes": 42, "impact_kg_co2e": -12.4},
            {"mode": "E-Bike", "mode_icon": "pedal_bike", "origin": "Home Office", "destination": "Downtown HQ", "distance_km": 6.2, "duration_minutes": 18, "impact_kg_co2e": -3.1},
            {"mode": "Fleet Vehicle (ICE)", "mode_icon": "directions_car", "origin": "Warehouse C", "destination": "Client Site Delta", "distance_km": 12.8, "duration_minutes": 25, "impact_kg_co2e": 4.2},
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "LA Distribution Center", "destination": "Phoenix Warehouse", "distance_km": 600, "duration_minutes": 420, "impact_kg_co2e": 195.0},
            {"mode": "Transit", "mode_icon": "directions_bus", "origin": "Airport Terminal", "destination": "City Center", "distance_km": 35, "duration_minutes": 55, "impact_kg_co2e": 8.5},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "Regional Office", "destination": "Client Meeting", "distance_km": 42, "duration_minutes": 60, "impact_kg_co2e": 18.2},
            {"mode": "Courier", "mode_icon": "two_wheeler", "origin": "Fulfillment Ctr B", "destination": "Customer Loc #1204", "distance_km": 8.5, "duration_minutes": 22, "impact_kg_co2e": 3.4},
            {"mode": "Transit", "mode_icon": "train", "origin": "Boston Terminal", "destination": "NYC Penn Station", "distance_km": 350, "duration_minutes": 210, "impact_kg_co2e": 22.1},
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "Portland Hub", "destination": "San Jose Depot", "distance_km": 950, "duration_minutes": 600, "impact_kg_co2e": 310.5},
            {"mode": "E-Bike", "mode_icon": "pedal_bike", "origin": "Riverside Park", "destination": "Tech Campus", "distance_km": 4.8, "duration_minutes": 14, "impact_kg_co2e": -2.4},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "Factory Floor A", "destination": "Supply Dock 3", "distance_km": 5.5, "duration_minutes": 12, "impact_kg_co2e": 3.8},
            {"mode": "Commuter Rail", "mode_icon": "train", "origin": "West End Station", "destination": "Financial District", "distance_km": 18.2, "duration_minutes": 28, "impact_kg_co2e": -8.9},
            {"mode": "Transit", "mode_icon": "directions_bus", "origin": "University Campus", "destination": "Research Park", "distance_km": 12.0, "duration_minutes": 30, "impact_kg_co2e": 4.1},
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "Memphis Logistics", "destination": "Nashville Center", "distance_km": 340, "duration_minutes": 240, "impact_kg_co2e": 112.0},
            {"mode": "Courier", "mode_icon": "two_wheeler", "origin": "Distribution Hub C", "destination": "Customer #2901", "distance_km": 11.2, "duration_minutes": 28, "impact_kg_co2e": 4.5},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "HQ Parking", "destination": "Airport Pickup", "distance_km": 28.0, "duration_minutes": 40, "impact_kg_co2e": 14.5},
            {"mode": "E-Bike", "mode_icon": "pedal_bike", "origin": "Green Lane", "destination": "Office Block B", "distance_km": 3.1, "duration_minutes": 10, "impact_kg_co2e": -1.5},
            {"mode": "Transit", "mode_icon": "train", "origin": "Central Station", "destination": "Suburban Depot", "distance_km": 65.0, "duration_minutes": 75, "impact_kg_co2e": 15.2},
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "Houston Port", "destination": "Dallas DC", "distance_km": 390, "duration_minutes": 300, "impact_kg_co2e": 128.0},
            {"mode": "Commuter Rail", "mode_icon": "train", "origin": "Oakwood Station", "destination": "Main St Terminal", "distance_km": 22.0, "duration_minutes": 35, "impact_kg_co2e": -10.5},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "Vendor Site Alpha", "destination": "Assembly Plant", "distance_km": 55.0, "duration_minutes": 70, "impact_kg_co2e": 24.0},
            {"mode": "Courier", "mode_icon": "two_wheeler", "origin": "Micro-Hub East", "destination": "Customer #3455", "distance_km": 6.8, "duration_minutes": 20, "impact_kg_co2e": 2.7},
            {"mode": "E-Bike", "mode_icon": "pedal_bike", "origin": "Bike Station 4", "destination": "Co-Working Space", "distance_km": 5.5, "duration_minutes": 16, "impact_kg_co2e": -2.8},
            {"mode": "Freight", "mode_icon": "local_shipping", "origin": "Atlanta Hub", "destination": "Miami Dist. Center", "distance_km": 1060, "duration_minutes": 720, "impact_kg_co2e": 345.0},
            {"mode": "Transit", "mode_icon": "directions_bus", "origin": "Stadium Complex", "destination": "Downtown Core", "distance_km": 8.0, "duration_minutes": 20, "impact_kg_co2e": 2.8},
            {"mode": "Fleet", "mode_icon": "directions_car", "origin": "Sales Office", "destination": "Product Demo Site", "distance_km": 32.0, "duration_minutes": 45, "impact_kg_co2e": 16.8},
        ]

        for i, data in enumerate(events_data):
            event = TransitEvent(
                user_id=user.id,
                timestamp=base_time + timedelta(hours=i * 2, minutes=i * 7),
                **data,
            )
            db.add(event)
        print(f"[OK] Created {len(events_data)} transit events")

        # ── 5. Create budget ──
        budget = Budget(
            user_id=user.id,
            cycle_name="MAY CYCLE",
            total_kg=1200,
            used_kg=845,
            start_date=date(2024, 5, 1),
            end_date=date(2024, 5, 31),
        )
        db.add(budget)
        print("[OK] Created active budget (MAY CYCLE)")

        # ── 6. Create green nodes ──
        green_nodes = [
            GreenNode(name="Metro Solar Hub", distance_km=1.2, rate_tco2e_per_day=5, status="Active", latitude=47.6062, longitude=-122.3321),
            GreenNode(name="Wind Farm Alpha", distance_km=5.8, rate_tco2e_per_day=12, status="Active", latitude=47.6205, longitude=-122.3493),
            GreenNode(name="Urban Forest Init.", distance_km=8.4, rate_tco2e_per_day=2, status="Offline", latitude=47.6555, longitude=-122.3034),
        ]
        db.add_all(green_nodes)
        print(f"[OK] Created {len(green_nodes)} green nodes")

        # ── 7. Create subsystems ──
        subsystems = [
            Subsystem(name="Location Services", icon="satellite_alt", uptime_percent=99.98, status="ONLINE", confidence_label="Signal Confidence", confidence_value="High (94%)", confidence_percent=94),
            Subsystem(name="Activity Recognition", icon="psychology", uptime_percent=99.95, status="ONLINE", confidence_label="Model Confidence", confidence_value="Optimum (88%)", confidence_percent=88),
            Subsystem(name="Data Sync Queue", icon="sync_alt", uptime_percent=98.42, status="DEGRADED", confidence_label="Queue Load", confidence_value="Heavy (76%)", confidence_percent=76),
        ]
        db.add_all(subsystems)
        print(f"[OK] Created {len(subsystems)} subsystems")

        # ── 8. Create engine preferences ──
        prefs = EnginePreference(
            user_id=user.id,
            background_processing=True,
            aggressive_optimization=False,
            verbose_debug=True,
        )
        db.add(prefs)
        print("[OK] Created engine preferences")

        await db.commit()
        print("\nDatabase seeded successfully!")
        print("Login: demo@carbontrack.io / password123")


if __name__ == "__main__":
    asyncio.run(seed())
