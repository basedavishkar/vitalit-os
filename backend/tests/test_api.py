import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import Base, get_db
from backend.models import User, Patient, Doctor
from backend.auth import create_access_token

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def get_auth_headers(client, test_user):
    """Helper function to get authentication headers"""
    client.post("/auth/register", json=test_user)
    login_response = client.post("/auth/login", data={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def client():
    # Set testing environment
    import os
    os.environ["TESTING"] = "true"
    
    # Enable test mode
    from backend.config import settings
    settings.test_mode = True
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
    
    # Clean up
    Base.metadata.drop_all(bind=engine)
    
    # Disable test mode
    settings.test_mode = False
    os.environ.pop("TESTING", None)

@pytest.fixture
def test_user():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "admin"
    }

@pytest.fixture
def test_patient():
    return {
        "patient_id": "P001",
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-01",
        "gender": "male",
        "address": "123 Main St",
        "phone": "1234567890",
        "email": "john.doe@example.com"
    }

@pytest.fixture
def test_doctor():
    return {
        "doctor_id": "D001",
        "first_name": "Dr. Jane",
        "last_name": "Smith",
        "specialization": "Cardiology",
        "qualification": "MD",
        "license_number": "LIC123456",
        "phone": "0987654321",
        "email": "jane.smith@hospital.com"
    }

class TestHealthCheck:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

class TestAuthentication:
    def test_register_user(self, client, test_user):
        response = client.post("/auth/register", json=test_user)
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
        assert "id" in data

    def test_login_user(self, client, test_user):
        # First register the user
        client.post("/auth/register", json=test_user)
        
        # Then login
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_invalid_login(self, client):
        login_data = {
            "username": "nonexistent",
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 401

class TestPatients:
    def test_create_patient(self, client, test_patient, test_user):
        headers = get_auth_headers(client, test_user)
        response = client.post("/patients/", json=test_patient, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == test_patient["first_name"]
        assert data["last_name"] == test_patient["last_name"]
        assert data["patient_id"] is not None  # Should be auto-generated

    def test_get_patients(self, client, test_patient, test_user):
        headers = get_auth_headers(client, test_user)
        
        # Create a patient first
        client.post("/patients/", json=test_patient, headers=headers)
        
        response = client.get("/patients/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert data[0]["first_name"] == test_patient["first_name"]

    def test_get_patient_by_id(self, client, test_patient, test_user):
        headers = get_auth_headers(client, test_user)
        # Create a patient first
        create_response = client.post("/patients/", json=test_patient, headers=headers)
        patient_id = create_response.json()["id"]
        
        response = client.get(f"/patients/{patient_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == test_patient["first_name"]

    def test_update_patient(self, client, test_patient, test_user):
        headers = get_auth_headers(client, test_user)
        # Create a patient first
        create_response = client.post("/patients/", json=test_patient, headers=headers)
        patient_id = create_response.json()["id"]
        
        update_data = {"first_name": "Updated Name"}
        response = client.put(f"/patients/{patient_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated Name"

    def test_delete_patient(self, client, test_patient, test_user):
        headers = get_auth_headers(client, test_user)
        # Create a patient first
        create_response = client.post("/patients/", json=test_patient, headers=headers)
        patient_id = create_response.json()["id"]
        
        response = client.delete(f"/patients/{patient_id}")
        assert response.status_code == 204

class TestDoctors:
    def test_create_doctor(self, client, test_doctor, test_user):
        headers = get_auth_headers(client, test_user)
        response = client.post("/doctors/", json=test_doctor, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == test_doctor["first_name"]
        assert data["last_name"] == test_doctor["last_name"]
        assert data["doctor_id"] is not None

    def test_get_doctors(self, client, test_doctor, test_user):
        headers = get_auth_headers(client, test_user)
        # Create a doctor first
        client.post("/doctors/", json=test_doctor, headers=headers)
        
        response = client.get("/doctors/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert data[0]["first_name"] == test_doctor["first_name"]

class TestAppointments:
    def test_create_appointment(self, client, test_patient, test_doctor, test_user):
        headers = get_auth_headers(client, test_user)
        # Create patient and doctor first
        patient_response = client.post("/patients/", json=test_patient, headers=headers)
        doctor_response = client.post("/doctors/", json=test_doctor, headers=headers)
        
        patient_id = patient_response.json()["id"]
        doctor_id = doctor_response.json()["id"]
        
        appointment_data = {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "scheduled_datetime": "2024-12-15T10:00:00",
            "reason": "Regular checkup",
            "duration_minutes": 30
        }
        
        response = client.post("/appointments/", json=appointment_data, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["reason"] == appointment_data["reason"]

class TestSystem:
    def test_system_status(self, client):
        response = client.get("/system/status")
        # This should require admin authentication, so expect 403
        assert response.status_code == 403

    def test_backup_endpoints(self, client):
        # Test backup endpoints (should require admin authentication)
        response = client.post("/system/backup")
        assert response.status_code == 403
        
        response = client.get("/system/backups")
        assert response.status_code == 403

class TestErrorHandling:
    def test_not_found_endpoint(self, client):
        response = client.get("/nonexistent")
        assert response.status_code == 404

    def test_invalid_patient_id(self, client):
        response = client.get("/patients/999999")
        assert response.status_code == 404

    def test_invalid_json(self, client):
        response = client.post("/patients/", data="invalid json")
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__]) 