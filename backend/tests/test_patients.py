import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import get_db, Base
from backend.models import User, Patient
from backend.auth import get_password_hash, create_access_token

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


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


@pytest.fixture(scope="function")
def test_user(db_session):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("SecurePass123!"),
        role="admin",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_patient(db_session):
    patient = Patient(
        patient_id="PAT001",
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 1, 1),
        gender="male",
        phone="1234567890",
        email="john.doe@example.com",
        address="123 Main St",
        blood_group="O+",
        emergency_contact_name="Jane Doe",
        emergency_contact_phone="0987654321"
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


@pytest.fixture(scope="function")
def auth_headers(test_user):
    access_token = create_access_token(data={"sub": test_user.username})
    return {"Authorization": f"Bearer {access_token}"}


class TestPatientManagement:
    """Test patient management endpoints"""

    def test_create_patient_success(self, client, auth_headers):
        """Test creating a new patient successfully"""
        response = client.post("/patients/", json={
            "patient_id": "PAT002",
            "first_name": "Alice",
            "last_name": "Johnson",
            "date_of_birth": "1985-05-15",
            "gender": "female",
            "phone": "5559876543",
            "email": "alice.johnson@example.com",
            "address": "456 Oak Ave",
            "blood_group": "A+"
        }, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == "Alice"
        assert data["patient_id"] is not None  # Should be auto-generated
        assert data["email"] == "alice.johnson@example.com"

    def test_create_patient_invalid_email(self, client, auth_headers):
        """Test creating patient with invalid email"""
        response = client.post("/patients/", json={
            "patient_id": "PAT003",
            "first_name": "Bob",
            "last_name": "Smith",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "phone": "1234567890",
            "email": "invalid-email",
            "address": "789 Pine St"
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_create_patient_invalid_date(self, client, auth_headers):
        """Test creating patient with invalid date"""
        response = client.post("/patients/", json={
            "patient_id": "PAT004",
            "first_name": "Carol",
            "last_name": "Brown",
            "date_of_birth": "invalid-date",
            "gender": "female",
            "phone": "1234567890",
            "email": "carol@example.com",
            "address": "321 Elm St"
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_get_patients_list(self, client, auth_headers, test_patient):
        """Test getting all patients"""
        response = client.get("/patients/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        assert data["items"][0]["first_name"] == "John"
        assert data["items"][0]["patient_id"] == "PAT001"

    def test_get_patient_by_id(self, client, auth_headers, test_patient):
        """Test getting a specific patient by ID"""
        response = client.get(f"/patients/{test_patient.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["patient_id"] == "PAT001"
        assert data["email"] == "john.doe@example.com"

    def test_get_patient_not_found(self, client, auth_headers):
        """Test getting a non-existent patient"""
        response = client.get("/patients/999999", headers=auth_headers)
        assert response.status_code == 404

    def test_update_patient_success(self, client, auth_headers, test_patient):
        """Test updating a patient successfully"""
        response = client.put(f"/patients/{test_patient.id}", json={
            "phone": "5551112222",
            "email": "john.updated@example.com",
            "address": "Updated Address"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "5551112222"
        assert data["email"] == "john.updated@example.com"
        assert data["address"] == "Updated Address"

    def test_update_patient_invalid_email(self, client, auth_headers, test_patient):
        """Test updating patient with invalid email"""
        response = client.put(f"/patients/{test_patient.id}", json={
            "email": "invalid-email"
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_delete_patient(self, client, auth_headers, test_patient):
        """Test deleting a patient"""
        response = client.delete(f"/patients/{test_patient.id}", headers=auth_headers)
        assert response.status_code == 204

    def test_delete_patient_not_found(self, client, auth_headers):
        """Test deleting a non-existent patient"""
        response = client.delete("/patients/999999", headers=auth_headers)
        assert response.status_code == 404

    def test_search_patients_by_name(self, client, auth_headers, test_patient):
        """Test searching patients by name"""
        response = client.get("/patients/search?name=John", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert "John" in data[0]["first_name"]

    def test_search_patients_by_email(self, client, auth_headers, test_patient):
        """Test searching patients by email"""
        response = client.get("/patients/search?email=john.doe@example.com", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["email"] == "john.doe@example.com"

    def test_get_patient_history(self, client, auth_headers, test_patient):
        """Test getting patient history"""
        response = client.get(f"/patients/{test_patient.id}/history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_get_patient_timeline(self, client, auth_headers, test_patient):
        """Test getting patient timeline"""
        response = client.get(f"/patients/{test_patient.id}/timeline", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_unauthorized_access(self, client):
        """Test accessing patient endpoints without authentication"""
        response = client.get("/patients/")
        assert response.status_code == 401

        response = client.post("/patients/", json={})
        assert response.status_code == 401

        response = client.get("/patients/1")
        assert response.status_code == 401


class TestPatientValidation:
    """Test patient data validation"""

    def test_required_fields_missing(self, client, auth_headers):
        """Test creating patient with missing required fields"""
        response = client.post("/patients/", json={
            "first_name": "Test"
            # Missing required fields
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_gender(self, client, auth_headers):
        """Test creating patient with invalid gender"""
        response = client.post("/patients/", json={
            "patient_id": "PAT005",
            "first_name": "Test",
            "last_name": "User",
            "date_of_birth": "1990-01-01",
            "gender": "invalid_gender",
            "phone": "1234567890",
            "email": "test@example.com"
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_blood_group(self, client, auth_headers):
        """Test creating patient with invalid blood group"""
        response = client.post("/patients/", json={
            "patient_id": "PAT006",
            "first_name": "Test",
            "last_name": "User",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "phone": "1234567890",
            "email": "test@example.com",
            "blood_group": "INVALID"
        }, headers=auth_headers)
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 