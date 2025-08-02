#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import engine, Base
from backend.config import settings

# Set test mode
settings.test_mode = True

# Create tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# Test data
test_user = {
    "username": "testuser",
    "password": "testpassword123",
    "email": "test@example.com",
    "role": "admin"
}

test_patient = {
    "patient_id": "P001",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": "MALE",
    "address": "123 Main St",
    "phone": "1234567890",
    "email": "john.doe@example.com"
}

# Register user
print("Registering user...")
register_response = client.post("/auth/register", json=test_user)
print(f"Register status: {register_response.status_code}")
if register_response.status_code != 201:
    print(f"Register error: {register_response.json()}")

# Login
print("\nLogging in...")
login_response = client.post("/auth/login", data={
    "username": test_user["username"],
    "password": test_user["password"]
})
print(f"Login status: {login_response.status_code}")
if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Token: {token[:20]}...")
else:
    print(f"Login error: {login_response.json()}")
    headers = {}

# Create patient
print("\nCreating patient...")
patient_response = client.post("/patients/", json=test_patient, headers=headers)
print(f"Patient creation status: {patient_response.status_code}")
print(f"Patient creation response: {patient_response.json()}")

# Clean up
Base.metadata.drop_all(bind=engine) 