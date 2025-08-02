import pytest
import json
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import get_db, Base
from backend.models import User, Patient, Doctor, Appointment, MedicalRecord, Bill, Payment
from backend.auth_enhanced import get_password_hash, create_access_token

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
    return TestClient(app)

@pytest.fixture(scope="function")
def test_user(db_session):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
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
def test_doctor(db_session):
    doctor = Doctor(
        doctor_id="DOC001",
        first_name="Dr. Jane",
        last_name="Smith",
        specialization="Cardiology",
        phone="5551234567",
        email="jane.smith@hospital.com",
        consultation_fee=150.0,
        is_active=True
    )
    db_session.add(doctor)
    db_session.commit()
    db_session.refresh(doctor)
    return doctor

@pytest.fixture(scope="function")
def auth_headers(test_user):
    access_token = create_access_token(data={"sub": test_user.username})
    return {"Authorization": f"Bearer {access_token}"}

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self, client):
        """Test user registration"""
        response = client.post("/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "role": "staff"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "hashed_password" not in data
    
    def test_login(self, client, test_user):
        """Test user login"""
        response = client.post("/auth/login", data={
            "username": "testuser",
            "password": "testpassword123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post("/auth/login", data={
            "username": "wronguser",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

class TestPatientManagement:
    """Test patient management endpoints"""
    
    def test_create_patient(self, client, auth_headers):
        """Test creating a new patient"""
        response = client.post("/patients/", json={
            "patient_id": "PAT002",
            "first_name": "Alice",
            "last_name": "Johnson",
            "date_of_birth": "1985-05-15",
            "gender": "FEMALE",
            "phone": "5559876543",
            "email": "alice.johnson@example.com",
            "address": "456 Oak Ave",
            "blood_group": "A+"
        }, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == "Alice"
        assert data["patient_id"] == "PAT002"
    
    def test_get_patients(self, client, auth_headers, test_patient):
        """Test getting all patients"""
        response = client.get("/patients/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        assert data["items"][0]["first_name"] == "John"
    
    def test_get_patient_by_id(self, client, auth_headers, test_patient):
        """Test getting a specific patient"""
        response = client.get(f"/patients/{test_patient.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"
        assert data["patient_id"] == "PAT001"
    
    def test_update_patient(self, client, auth_headers, test_patient):
        """Test updating a patient"""
        response = client.put(f"/patients/{test_patient.id}", json={
            "phone": "5551112222",
            "email": "john.updated@example.com"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "5551112222"
        assert data["email"] == "john.updated@example.com"

class TestDoctorManagement:
    """Test doctor management endpoints"""
    
    def test_create_doctor(self, client, auth_headers):
        """Test creating a new doctor"""
        response = client.post("/doctors/", json={
            "doctor_id": "DOC002",
            "first_name": "Dr. Bob",
            "last_name": "Wilson",
            "specialization": "Neurology",
            "phone": "5554443333",
            "email": "bob.wilson@hospital.com",
            "consultation_fee": 200.0
        }, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == "Dr. Bob"
        assert data["specialization"] == "Neurology"
    
    def test_get_doctors(self, client, auth_headers, test_doctor):
        """Test getting all doctors"""
        response = client.get("/doctors/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["first_name"] == "Dr. Jane"

class TestAppointmentManagement:
    """Test appointment management endpoints"""
    
    def test_create_appointment(self, client, auth_headers, test_patient, test_doctor):
        """Test creating a new appointment"""
        appointment_data = {
            "patient_id": test_patient.id,
            "doctor_id": test_doctor.id,
            "scheduled_datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "reason": "Regular checkup",
            "duration_minutes": 30
        }
        response = client.post("/appointments/", json=appointment_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["reason"] == "Regular checkup"
        assert data["patient_id"] == test_patient.id
    
    def test_get_appointments(self, client, auth_headers):
        """Test getting all appointments"""
        response = client.get("/appointments/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestMedicalRecords:
    """Test medical records endpoints"""
    
    def test_create_medical_record(self, client, auth_headers, test_patient, test_doctor):
        """Test creating a medical record"""
        record_data = {
            "patient_id": test_patient.id,
            "doctor_id": test_doctor.id,
            "chief_complaint": "Chest pain",
            "diagnosis": "Angina",
            "treatment_plan": "Prescribed nitroglycerin",
            "prescription_notes": "Take as needed"
        }
        response = client.post("/records/", json=record_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["diagnosis"] == "Angina"
        assert data["chief_complaint"] == "Chest pain"

class TestBilling:
    """Test billing endpoints"""
    
    def test_create_bill(self, client, auth_headers, test_patient):
        """Test creating a bill"""
        bill_data = {
            "patient_id": test_patient.id,
            "subtotal": 150.0,
            "tax_amount": 12.0,
            "total_amount": 162.0,
            "payment_status": "pending"
        }
        response = client.post("/billing/", json=bill_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["total_amount"] == 162.0
        assert data["payment_status"] == "pending"

class TestAnalytics:
    """Test analytics endpoints"""
    
    def test_dashboard_overview(self, client, auth_headers):
        """Test dashboard overview endpoint"""
        response = client.get("/analytics/dashboard/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "overview" in data
        assert "today" in data
        assert "monthly" in data
    
    def test_patient_analytics(self, client, auth_headers):
        """Test patient analytics endpoint"""
        response = client.get("/analytics/dashboard/patients", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "age_distribution" in data
        assert "gender_distribution" in data

class TestCommunication:
    """Test communication endpoints"""
    
    def test_send_internal_message(self, client, auth_headers, test_user):
        """Test sending internal message"""
        message_data = {
            "recipient_id": test_user.id,
            "subject": "Test Message",
            "message": "This is a test message",
            "priority": "normal"
        }
        response = client.post("/communication/messages/send", json=message_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == "Test Message"
    
    def test_get_inbox_messages(self, client, auth_headers):
        """Test getting inbox messages"""
        response = client.get("/communication/messages/inbox", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestSecurity:
    """Test security features"""
    
    def test_password_validation(self, client):
        """Test password validation"""
        # Test weak password
        response = client.post("/auth/register", json={
            "username": "weakuser",
            "email": "weak@example.com",
            "password": "123",
            "role": "staff"
        })
        assert response.status_code == 422  # Validation error
    
    def test_unauthorized_access(self, client):
        """Test unauthorized access to protected endpoints"""
        response = client.get("/patients/")
        assert response.status_code == 401
    
    def test_role_based_access(self, client, auth_headers):
        """Test role-based access control"""
        # This would require setting up different user roles
        response = client.get("/patients/", headers=auth_headers)
        assert response.status_code == 200

class TestDataValidation:
    """Test data validation"""
    
    def test_invalid_email(self, client, auth_headers):
        """Test invalid email validation"""
        response = client.post("/patients/", json={
            "patient_id": "PAT003",
            "first_name": "Test",
            "last_name": "User",
            "date_of_birth": "1990-01-01",
            "gender": "MALE",
            "email": "invalid-email",
            "phone": "1234567890"
        }, headers=auth_headers)
        assert response.status_code == 422
    
    def test_invalid_date(self, client, auth_headers):
        """Test invalid date validation"""
        response = client.post("/patients/", json={
            "patient_id": "PAT004",
            "first_name": "Test",
            "last_name": "User",
            "date_of_birth": "invalid-date",
            "gender": "MALE",
            "email": "test@example.com",
            "phone": "1234567890"
        }, headers=auth_headers)
        assert response.status_code == 422

class TestErrorHandling:
    """Test error handling"""
    
    def test_not_found(self, client, auth_headers):
        """Test 404 error handling"""
        response = client.get("/patients/999999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_validation_error(self, client, auth_headers):
        """Test validation error handling"""
        response = client.post("/patients/", json={
            "invalid_field": "invalid_value"
        }, headers=auth_headers)
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 