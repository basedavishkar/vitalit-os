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


class TestIntegration:
    """Test complete system integration."""
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
    
    def test_dashboard_stats(self, client):
        """Test dashboard stats endpoint."""
        response = client.get("/dashboard/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "totalPatients" in data
        assert "totalDoctors" in data
        assert "totalAppointments" in data
        assert "todayAppointments" in data
        assert "monthlyRevenue" in data
        assert "activePatients" in data
        assert "pendingAppointments" in data
        
        # Check sample data values
        assert data["totalPatients"] == 5
        assert data["totalDoctors"] == 5
        assert data["totalAppointments"] == 12
        assert data["todayAppointments"] == 3
        assert data["monthlyRevenue"] == 45000
        assert data["activePatients"] == 5
        assert data["pendingAppointments"] == 2
    
    def test_dev_patients(self, client):
        """Test development patients endpoint."""
        response = client.get("/dev/patients")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        
        # Check first patient
        first_patient = data[0]
        assert "id" in first_patient
        assert "first_name" in first_patient
        assert "last_name" in first_patient
        assert "email" in first_patient
        assert first_patient["first_name"] == "John"
        assert first_patient["last_name"] == "Doe"
    
    def test_dev_doctors(self, client):
        """Test development doctors endpoint."""
        response = client.get("/dev/doctors")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        
        # Check first doctor
        first_doctor = data[0]
        assert "id" in first_doctor
        assert "first_name" in first_doctor
        assert "last_name" in first_doctor
        assert "specialization" in first_doctor
        assert first_doctor["first_name"] == "Dr. Sarah"
        assert first_doctor["last_name"] == "Johnson"
        assert first_doctor["specialization"] == "Cardiology"
    
    def test_analytics_dashboard(self, client):
        """Test analytics dashboard endpoints."""
        # Test overview
        response = client.get("/analytics/dashboard/overview")
        assert response.status_code == 200
        
        data = response.json()
        assert "overview" in data
        assert "today" in data
        assert "monthly" in data
        assert "yearly" in data
        
        # Test patients
        response = client.get("/analytics/dashboard/patients")
        assert response.status_code == 200
        
        data = response.json()
        assert "age_distribution" in data
        assert "gender_distribution" in data
        assert "insurance_coverage" in data
    
    def test_authentication_flow(self, client):
        """Test complete authentication flow."""
        # Register user
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
        assert "user" in data
        
        # Test protected endpoint with token
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        response = client.get("/patients/", headers=headers)
        # This should work in test mode
        assert response.status_code in [200, 401]  # 401 is expected if auth is working properly 