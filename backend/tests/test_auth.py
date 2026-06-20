from unittest.mock import AsyncMock
from app.models.user import User


def test_register_success(client, mocker):
    mocker.patch(
        "app.routers.auth.register_user",
        new_callable=AsyncMock,
        return_value=User(
            id=1,
            email="test@test.com",
            full_name="Test User",
            hashed_password="hashed",
            role="user",
        ),
    )

    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
            "password": "password123",
            "full_name": "Test User",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "test@test.com"


def test_register_conflict(client, mocker):
    mocker.patch(
        "app.routers.auth.register_user",
        new_callable=AsyncMock,
        side_effect=ValueError("Email already registered"),
    )

    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
            "password": "password123",
            "full_name": "Test User",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


def test_login_success(client, mocker):
    mocker.patch(
        "app.routers.auth.authenticate_user",
        new_callable=AsyncMock,
        return_value={
            "access_token": "token",
            "refresh_token": "refresh",
            "token_type": "bearer",
        },
    )

    response = client.post(
        "/api/auth/login", json={"email": "test@test.com", "password": "password123"}
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "token"


def test_login_failure(client, mocker):
    mocker.patch(
        "app.routers.auth.authenticate_user", new_callable=AsyncMock, return_value=None
    )

    response = client.post(
        "/api/auth/login", json={"email": "test@test.com", "password": "wrong"}
    )

    assert response.status_code == 401
