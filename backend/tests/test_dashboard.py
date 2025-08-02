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


class TestDashboard:
    """Test dashboard endpoints."""
    
    def test_dashboard_stats(self, client):
        """Test basic dashboard stats endpoint."""
        response = client.get("/dashboard/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "totalPatients" in data
        assert "totalDoctors" in data
        assert "totalAppointments" in data
        assert "todayAppointments" in data
        assert "monthlyRevenue" in data
        assert "activePatients" in data
        
        # All values should be numbers
        assert isinstance(data["totalPatients"], int)
        assert isinstance(data["totalDoctors"], int)
        assert isinstance(data["totalAppointments"], int)
        assert isinstance(data["todayAppointments"], int)
        assert isinstance(data["monthlyRevenue"], int)
        assert isinstance(data["activePatients"], int)
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
    
    def test_analytics_dashboard_overview(self, client):
        """Test analytics dashboard overview endpoint."""
        # In test mode, this should work without authentication
        response = client.get("/analytics/dashboard/overview")
        assert response.status_code == 200
        
        data = response.json()
        assert "overview" in data
        assert "today" in data
        assert "monthly" in data
        assert "yearly" in data
    
    def test_analytics_dashboard_patients(self, client):
        """Test analytics dashboard patients endpoint."""
        # In test mode, this should work without authentication
        response = client.get("/analytics/dashboard/patients")
        assert response.status_code == 200
        
        data = response.json()
        assert "age_distribution" in data
        assert "gender_distribution" in data
        assert "insurance_coverage" in data 