import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import engine, Base
from backend.config import settings

# Set test mode
settings.test_mode = True

@pytest.fixture(scope="function")
def client():
    """Test client with database setup."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
    
    # Clean up
    Base.metadata.drop_all(bind=engine)


class TestAuthIntegration:
    """Test authentication integration."""
    
    def test_register_and_login(self, client):
        """Test user registration and login flow."""
        # Register a user
        register_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "role": "staff"
        }
        
        response = client.post("/auth/register", json=register_data)
        assert response.status_code == 201
        
        # Login
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        
        # Test accessing protected endpoint
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        response = client.get("/patients/", headers=headers)
        assert response.status_code == 200
    
    def test_dashboard_with_auth(self, client):
        """Test dashboard endpoints with authentication."""
        # Register and login
        register_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "role": "staff"
        }
        
        client.post("/auth/register", json=register_data)
        
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        response = client.post("/auth/login", data=login_data)
        data = response.json()
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        
        # Test dashboard stats
        response = client.get("/dashboard/stats", headers=headers)
        assert response.status_code == 200
        
        # Test analytics dashboard
        response = client.get("/analytics/dashboard/overview", headers=headers)
        assert response.status_code == 200
        
        response = client.get("/analytics/dashboard/patients", headers=headers)
        assert response.status_code == 200 