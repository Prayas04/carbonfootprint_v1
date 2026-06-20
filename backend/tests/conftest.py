import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User

async def override_get_db():
    yield None

async def override_get_current_user():
    return User(id=1, email="test@test.com", full_name="Test User", role="user")

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client
