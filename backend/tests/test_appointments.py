import pytest
from datetime import datetime, timedelta, date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import get_db, Base
from backend.models import User, Patient, Doctor, Appointment
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
    return TestClient(app)


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
        email="john.doe@example.com"
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


class TestAppointmentManagement:
    """Test appointment management endpoints"""

    def test_create_appointment_success(self, client, auth_headers, test_patient, test_doctor):
        """Test creating a new appointment successfully"""
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
        assert data["doctor_id"] == test_doctor.id

    def test_create_appointment_past_date(self, client, auth_headers, test_patient, test_doctor):
        """Test creating appointment with past date"""
        appointment_data = {
            "patient_id": test_patient.id,
            "doctor_id": test_doctor.id,
            "scheduled_datetime": (datetime.now() - timedelta(days=1)).isoformat(),
            "reason": "Checkup",
            "duration_minutes": 30
        }
        response = client.post("/appointments/", json=appointment_data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_appointment_invalid_duration(self, client, auth_headers, test_patient, test_doctor):
        """Test creating appointment with invalid duration"""
        appointment_data = {
            "patient_id": test_patient.id,
            "doctor_id": test_doctor.id,
            "scheduled_datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "reason": "Checkup",
            "duration_minutes": 5  # Too short
        }
        response = client.post("/appointments/", json=appointment_data, headers=auth_headers)
        assert response.status_code == 422

    def test_get_appointments_list(self, client, auth_headers):
        """Test getting all appointments"""
        response = client.get("/appointments/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_appointment_by_id(self, client, auth_headers, test_patient, test_doctor, db_session):
        """Test getting a specific appointment"""
        # Create an appointment first
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            scheduled_datetime=datetime.now() + timedelta(days=1),
            reason="Test appointment",
            duration_minutes=30
        )
        db_session.add(appointment)
        db_session.commit()
        db_session.refresh(appointment)

        response = client.get(f"/appointments/{appointment.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["reason"] == "Test appointment"

    def test_update_appointment(self, client, auth_headers, test_patient, test_doctor, db_session):
        """Test updating an appointment"""
        # Create an appointment first
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            scheduled_datetime=datetime.now() + timedelta(days=1),
            reason="Original reason",
            duration_minutes=30
        )
        db_session.add(appointment)
        db_session.commit()
        db_session.refresh(appointment)

        response = client.put(f"/appointments/{appointment.id}", json={
            "reason": "Updated reason",
            "duration_minutes": 45
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["reason"] == "Updated reason"
        assert data["duration_minutes"] == 45

    def test_cancel_appointment(self, client, auth_headers, test_patient, test_doctor, db_session):
        """Test canceling an appointment"""
        # Create an appointment first
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            scheduled_datetime=datetime.now() + timedelta(days=1),
            reason="Test appointment",
            duration_minutes=30
        )
        db_session.add(appointment)
        db_session.commit()
        db_session.refresh(appointment)

        response = client.post(f"/appointments/{appointment.id}/cancel", headers=auth_headers)
        assert response.status_code == 200

    def test_get_doctor_appointments(self, client, auth_headers, test_doctor):
        """Test getting appointments for a specific doctor"""
        response = client.get(f"/appointments/doctor/{test_doctor.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_patient_appointments(self, client, auth_headers, test_patient):
        """Test getting appointments for a specific patient"""
        response = client.get(f"/appointments/patient/{test_patient.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_unauthorized_access(self, client):
        """Test accessing appointment endpoints without authentication"""
        response = client.get("/appointments/")
        assert response.status_code == 401

        response = client.post("/appointments/", json={})
        assert response.status_code == 401


class TestSmartAppointments:
    """Test smart appointment features"""

    def test_smart_schedule_appointment(self, client, auth_headers, test_patient, test_doctor):
        """Test smart appointment scheduling"""
        appointment_data = {
            "patient_id": test_patient.id,
            "doctor_id": test_doctor.id,
            "preferred_date": (date.today() + timedelta(days=1)).isoformat(),
            "reason": "Smart scheduling test",
            "duration_minutes": 30
        }
        response = client.post("/appointments/smart-schedule", json=appointment_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "appointment_id" in data

    def test_get_available_slots(self, client, auth_headers, test_doctor):
        """Test getting available appointment slots"""
        tomorrow = date.today() + timedelta(days=1)
        response = client.get(f"/appointments/available-slots/{test_doctor.id}?date={tomorrow}&duration_minutes=30", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "available_slots" in data
        assert "total_slots" in data

    def test_check_scheduling_conflicts(self, client, auth_headers, test_doctor):
        """Test checking for scheduling conflicts"""
        start_time = datetime.now() + timedelta(days=1, hours=9)
        response = client.get(f"/appointments/conflicts/{test_doctor.id}?start_time={start_time.isoformat()}&duration_minutes=30", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "available" in data

    def test_get_doctor_calendar(self, client, auth_headers, test_doctor):
        """Test getting doctor's calendar"""
        start_date = date.today()
        end_date = start_date + timedelta(days=7)
        response = client.get(f"/appointments/calendar/{test_doctor.id}?start_date={start_date}&end_date={end_date}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAppointmentValidation:
    """Test appointment data validation"""

    def test_missing_required_fields(self, client, auth_headers):
        """Test creating appointment with missing required fields"""
        response = client.post("/appointments/", json={
            "reason": "Test"
            # Missing required fields
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_patient_id(self, client, auth_headers, test_doctor):
        """Test creating appointment with invalid patient ID"""
        appointment_data = {
            "patient_id": 999999,  # Non-existent patient
            "doctor_id": test_doctor.id,
            "scheduled_datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "reason": "Test",
            "duration_minutes": 30
        }
        response = client.post("/appointments/", json=appointment_data, headers=auth_headers)
        assert response.status_code == 404

    def test_invalid_doctor_id(self, client, auth_headers, test_patient):
        """Test creating appointment with invalid doctor ID"""
        appointment_data = {
            "patient_id": test_patient.id,
            "doctor_id": 999999,  # Non-existent doctor
            "scheduled_datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "reason": "Test",
            "duration_minutes": 30
        }
        response = client.post("/appointments/", json=appointment_data, headers=auth_headers)
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 