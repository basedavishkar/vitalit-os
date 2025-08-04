import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import get_db, Base
from backend.models import User, Patient, Bill, Payment
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
def auth_headers(test_user):
    access_token = create_access_token(data={"sub": test_user.username})
    return {"Authorization": f"Bearer {access_token}"}


class TestBillingManagement:
    """Test billing management endpoints"""

    def test_create_bill_success(self, client, auth_headers, test_patient):
        """Test creating a new bill successfully"""
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
        assert data["patient_id"] == test_patient.id

    def test_create_bill_invalid_amount(self, client, auth_headers, test_patient):
        """Test creating bill with invalid amount"""
        bill_data = {
            "patient_id": test_patient.id,
            "subtotal": -50.0,  # Negative amount
            "tax_amount": 0.0,
            "total_amount": -50.0,
            "payment_status": "pending"
        }
        response = client.post("/billing/", json=bill_data, headers=auth_headers)
        assert response.status_code == 422

    def test_get_bills_list(self, client, auth_headers):
        """Test getting all bills"""
        response = client.get("/billing/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_bill_by_id(self, client, auth_headers, test_patient, db_session):
        """Test getting a specific bill"""
        # Create a bill first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        response = client.get(f"/billing/{bill.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_amount"] == 108.0
        assert data["payment_status"] == "pending"

    def test_update_bill(self, client, auth_headers, test_patient, db_session):
        """Test updating a bill"""
        # Create a bill first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        response = client.put(f"/billing/{bill.id}", json={
            "payment_status": "paid",
            "notes": "Payment received"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "paid"
        assert data["notes"] == "Payment received"

    def test_delete_bill(self, client, auth_headers, test_patient, db_session):
        """Test deleting a bill"""
        # Create a bill first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        response = client.delete(f"/billing/{bill.id}", headers=auth_headers)
        assert response.status_code == 204

    def test_get_patient_bills(self, client, auth_headers, test_patient):
        """Test getting bills for a specific patient"""
        response = client.get(f"/billing/patient/{test_patient.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_unauthorized_access(self, client):
        """Test accessing billing endpoints without authentication"""
        response = client.get("/billing/")
        assert response.status_code == 401

        response = client.post("/billing/", json={})
        assert response.status_code == 401


class TestPaymentProcessing:
    """Test payment processing endpoints"""

    def test_create_payment(self, client, auth_headers, test_patient, db_session):
        """Test creating a payment"""
        # Create a bill first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        payment_data = {
            "bill_id": bill.id,
            "amount": 108.0,
            "payment_method": "card",
            "payment_date": date.today().isoformat()
        }
        response = client.post("/billing/payments/", json=payment_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 108.0
        assert data["payment_method"] == "card"

    def test_create_payment_invalid_method(self, client, auth_headers, test_patient, db_session):
        """Test creating payment with invalid method"""
        # Create a bill first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        payment_data = {
            "bill_id": bill.id,
            "amount": 108.0,
            "payment_method": "invalid_method",
            "payment_date": date.today().isoformat()
        }
        response = client.post("/billing/payments/", json=payment_data, headers=auth_headers)
        assert response.status_code == 422

    def test_get_payments_list(self, client, auth_headers):
        """Test getting all payments"""
        response = client.get("/billing/payments/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_payment_by_id(self, client, auth_headers, test_patient, db_session):
        """Test getting a specific payment"""
        # Create a bill and payment first
        bill = Bill(
            patient_id=test_patient.id,
            subtotal=100.0,
            tax_amount=8.0,
            total_amount=108.0,
            payment_status="pending"
        )
        db_session.add(bill)
        db_session.commit()
        db_session.refresh(bill)

        payment = Payment(
            bill_id=bill.id,
            amount=108.0,
            payment_method="card",
            payment_date=date.today()
        )
        db_session.add(payment)
        db_session.commit()
        db_session.refresh(payment)

        response = client.get(f"/billing/payments/{payment.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 108.0
        assert data["payment_method"] == "card"


class TestAutomatedBilling:
    """Test automated billing features"""

    def test_generate_bill(self, client, auth_headers, test_patient):
        """Test automated bill generation"""
        bill_data = {
            "patient_id": test_patient.id,
            "services": [
                {"service_name": "Consultation", "amount": 100.0},
                {"service_name": "Lab Test", "amount": 50.0}
            ],
            "tax_rate": 0.08
        }
        response = client.post("/billing/generate", json=bill_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "bill_id" in data
        assert "total_amount" in data

    def test_calculate_bill_amount(self, client, auth_headers):
        """Test bill amount calculation"""
        calculation_data = {
            "services": [
                {"service_name": "Consultation", "amount": 100.0},
                {"service_name": "Lab Test", "amount": 50.0}
            ],
            "tax_rate": 0.08,
            "discount_percentage": 10.0
        }
        response = client.post("/billing/calculate", json=calculation_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "subtotal" in data
        assert "tax_amount" in data
        assert "discount_amount" in data
        assert "total_amount" in data

    def test_get_revenue_report(self, client, auth_headers):
        """Test getting revenue report"""
        start_date = date.today() - timedelta(days=30)
        end_date = date.today()
        response = client.get(f"/billing/reports/revenue?start_date={start_date}&end_date={end_date}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data
        assert "payment_methods" in data

    def test_get_outstanding_bills(self, client, auth_headers):
        """Test getting outstanding bills"""
        response = client.get("/billing/outstanding", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestBillingValidation:
    """Test billing data validation"""

    def test_missing_required_fields(self, client, auth_headers):
        """Test creating bill with missing required fields"""
        response = client.post("/billing/", json={
            "subtotal": 100.0
            # Missing required fields
        }, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_patient_id(self, client, auth_headers):
        """Test creating bill with invalid patient ID"""
        bill_data = {
            "patient_id": 999999,  # Non-existent patient
            "subtotal": 100.0,
            "tax_amount": 8.0,
            "total_amount": 108.0,
            "payment_status": "pending"
        }
        response = client.post("/billing/", json=bill_data, headers=auth_headers)
        assert response.status_code == 404

    def test_invalid_payment_status(self, client, auth_headers, test_patient):
        """Test creating bill with invalid payment status"""
        bill_data = {
            "patient_id": test_patient.id,
            "subtotal": 100.0,
            "tax_amount": 8.0,
            "total_amount": 108.0,
            "payment_status": "invalid_status"
        }
        response = client.post("/billing/", json=bill_data, headers=auth_headers)
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 