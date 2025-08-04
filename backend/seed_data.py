#!/usr/bin/env python3
"""
Seed data for VITALIt Healthcare System
"""

import os
import sys
from datetime import datetime, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Patient, Doctor, User, GenderEnum
from database import DATABASE_URL
import bcrypt

def create_test_data():
    """Create test data for the application."""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_patients = db.query(Patient).count()
        existing_doctors = db.query(Doctor).count()
        existing_users = db.query(User).count()
        
        if existing_patients > 0 and existing_doctors > 0 and existing_users > 0:
            print("Test data already exists. Skipping creation.")
            return
        
        print("Creating test data...")
        
        # Create admin user
        admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin_user = User(
            username="admin",
            email="admin@vitalit.com",
            hashed_password=admin_password.decode('utf-8'),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        
        # Create test patients
        test_patients = [
            {
                "patient_id": "P001",
                "first_name": "John",
                "last_name": "Doe",
                "date_of_birth": date(1990, 5, 15),
                "gender": GenderEnum.male,
                "blood_group": "A+",
                "address": "123 Main St, City, State 12345",
                "phone": "+1-555-0123",
                "email": "john.doe@email.com",
                "emergency_contact_name": "Jane Doe",
                "emergency_contact_phone": "+1-555-0124",
                "emergency_contact_relationship": "Spouse",
                "insurance_provider": "Blue Cross",
                "insurance_number": "BC123456789",
                "allergies": "Penicillin",
                "medical_history": "Hypertension, Diabetes Type 2"
            },
            {
                "patient_id": "P002",
                "first_name": "Jane",
                "last_name": "Smith",
                "date_of_birth": date(1985, 8, 22),
                "gender": GenderEnum.female,
                "blood_group": "O+",
                "address": "456 Oak Ave, City, State 12345",
                "phone": "+1-555-0125",
                "email": "jane.smith@email.com",
                "emergency_contact_name": "Bob Smith",
                "emergency_contact_phone": "+1-555-0126",
                "emergency_contact_relationship": "Husband",
                "insurance_provider": "Aetna",
                "insurance_number": "AE987654321",
                "allergies": "None",
                "medical_history": "Asthma"
            },
            {
                "patient_id": "P003",
                "first_name": "Bob",
                "last_name": "Johnson",
                "date_of_birth": date(1978, 12, 10),
                "gender": GenderEnum.male,
                "blood_group": "B+",
                "address": "789 Pine Rd, City, State 12345",
                "phone": "+1-555-0127",
                "email": "bob.johnson@email.com",
                "emergency_contact_name": "Mary Johnson",
                "emergency_contact_phone": "+1-555-0128",
                "emergency_contact_relationship": "Wife",
                "insurance_provider": "Cigna",
                "insurance_number": "CI456789123",
                "allergies": "Shellfish",
                "medical_history": "High Cholesterol"
            },
            {
                "patient_id": "P004",
                "first_name": "Alice",
                "last_name": "Brown",
                "date_of_birth": date(1992, 3, 8),
                "gender": GenderEnum.female,
                "blood_group": "AB+",
                "address": "321 Elm St, City, State 12345",
                "phone": "+1-555-0129",
                "email": "alice.brown@email.com",
                "emergency_contact_name": "Charlie Brown",
                "emergency_contact_phone": "+1-555-0130",
                "emergency_contact_relationship": "Brother",
                "insurance_provider": "UnitedHealth",
                "insurance_number": "UH789123456",
                "allergies": "Latex",
                "medical_history": "Migraine"
            },
            {
                "patient_id": "P005",
                "first_name": "Charlie",
                "last_name": "Wilson",
                "date_of_birth": date(1988, 11, 25),
                "gender": GenderEnum.male,
                "blood_group": "O-",
                "address": "654 Maple Dr, City, State 12345",
                "phone": "+1-555-0131",
                "email": "charlie.wilson@email.com",
                "emergency_contact_name": "Diana Wilson",
                "emergency_contact_phone": "+1-555-0132",
                "emergency_contact_relationship": "Sister",
                "insurance_provider": "Humana",
                "insurance_number": "HU321654987",
                "allergies": "Peanuts",
                "medical_history": "Depression"
            }
        ]
        
        for patient_data in test_patients:
            patient = Patient(**patient_data)
            db.add(patient)
        
        # Create test doctors
        test_doctors = [
            {
                "doctor_id": "D001",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "specialization": "Cardiology",
                "qualification": "MD, FACC",
                "license_number": "MD123456",
                "phone": "+1-555-0201",
                "email": "sarah.johnson@vitalit.com",
                "address": "100 Medical Center Dr, City, State 12345",
                "consultation_fee": 150.00,
                "is_active": True
            },
            {
                "doctor_id": "D002",
                "first_name": "Michael",
                "last_name": "Chen",
                "specialization": "Neurology",
                "qualification": "MD, PhD",
                "license_number": "MD234567",
                "phone": "+1-555-0202",
                "email": "michael.chen@vitalit.com",
                "address": "200 Medical Center Dr, City, State 12345",
                "consultation_fee": 180.00,
                "is_active": True
            },
            {
                "doctor_id": "D003",
                "first_name": "Emily",
                "last_name": "Davis",
                "specialization": "Pediatrics",
                "qualification": "MD, FAAP",
                "license_number": "MD345678",
                "phone": "+1-555-0203",
                "email": "emily.davis@vitalit.com",
                "address": "300 Medical Center Dr, City, State 12345",
                "consultation_fee": 120.00,
                "is_active": True
            },
            {
                "doctor_id": "D004",
                "first_name": "Robert",
                "last_name": "Wilson",
                "specialization": "Orthopedics",
                "qualification": "MD, FACS",
                "license_number": "MD456789",
                "phone": "+1-555-0204",
                "email": "robert.wilson@vitalit.com",
                "address": "400 Medical Center Dr, City, State 12345",
                "consultation_fee": 200.00,
                "is_active": True
            },
            {
                "doctor_id": "D005",
                "first_name": "Lisa",
                "last_name": "Garcia",
                "specialization": "Dermatology",
                "qualification": "MD, FAAD",
                "license_number": "MD567890",
                "phone": "+1-555-0205",
                "email": "lisa.garcia@vitalit.com",
                "address": "500 Medical Center Dr, City, State 12345",
                "consultation_fee": 160.00,
                "is_active": True
            }
        ]
        
        for doctor_data in test_doctors:
            doctor = Doctor(**doctor_data)
            db.add(doctor)
        
        db.commit()
        print("Test data created successfully!")
        print(f"- {len(test_patients)} patients created")
        print(f"- {len(test_doctors)} doctors created")
        print(f"- 1 admin user created")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating test data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data() 