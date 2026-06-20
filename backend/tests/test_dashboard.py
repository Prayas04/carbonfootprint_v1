from unittest.mock import AsyncMock


def test_dashboard_endpoint(client, mocker):
    mock_data = {
        "global_impact": {"total_co2e_kg": 100.0, "trend_data": []},
        "daily_insight": {
            "message": "Good!",
            "icon": "check",
            "streak_days": 2,
            "co2_saved_today": 0,
        },
        "budget": {
            "cycle_name": "Month",
            "total_kg": 500,
            "used_kg": 100,
            "remaining_kg": 400,
            "percent_used": 20,
        },
        "recent_events": [],
    }

    mocker.patch(
        "app.routers.dashboard.get_dashboard_data",
        new_callable=AsyncMock,
        return_value=mock_data,
    )

    response = client.get("/api/dashboard")
    assert response.status_code == 200
    assert response.json()["global_impact"]["total_co2e_kg"] == 100.0
