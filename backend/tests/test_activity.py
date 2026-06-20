from unittest.mock import AsyncMock


def test_get_metrics(client, mocker):
    mocker.patch(
        "app.routers.activity.get_metrics",
        new_callable=AsyncMock,
        return_value={
            "metrics": [
                {
                    "label": "Total",
                    "icon": "info",
                    "value": "10",
                    "unit": "kg",
                    "trend": "up",
                    "trend_color": "green",
                }
            ]
        },
    )

    response = client.get("/api/activity/metrics")
    assert response.status_code == 200
    assert "metrics" in response.json()


def test_list_events(client, mocker):
    mocker.patch(
        "app.routers.activity.get_events",
        new_callable=AsyncMock,
        return_value={
            "data": [],
            "pagination": {
                "page": 1,
                "per_page": 10,
                "total_items": 0,
                "total_pages": 0,
            },
        },
    )

    response = client.get("/api/activity/events?page=1&per_page=10")
    assert response.status_code == 200
    assert "data" in response.json()


def test_create_event(client, mocker):
    class MockEvent:
        id = 1

    mocker.patch(
        "app.routers.activity.create_event",
        new_callable=AsyncMock,
        return_value=MockEvent(),
    )

    response = client.post(
        "/api/activity/events",
        json={
            "timestamp": "2023-01-01T00:00:00Z",
            "mode": "Bus",
            "mode_icon": "directions_bus",
            "origin": "Home",
            "destination": "Work",
            "distance_km": 10.5,
            "duration_minutes": 30,
            "impact_kg_co2e": 1.5,
        },
    )

    assert response.status_code == 201
    assert response.json()["id"] == 1
