#!/usr/bin/env python3
"""
Seed data script for VITALIt-OS
Populates the database with initial users, patients, doctors, and sample data.
"""

import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import (
    User, Patient, Doctor, Appointment, MedicalRecord, 
    PatientVitals, Prescription, PrescriptionItem, Bill, 
    BillItem, Payment, InventoryItem, InventoryTransaction,
    GenderEnum, PaymentStatusEnum, AppointmentStatusEnum
)
from backend.auth import get_password_hash

def create_seed_data():
    """Create seed data for the application."""
    
    db = SessionLocal()
    
    try:
        print("🌱 Creating seed data for VITALIt-OS...")
        
        # Create users
        print("👥 Creating users...")
        users = [
            User(
                username="admin",
                email="admin@vitalit.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            ),
            User(
                username="doctor1",
                email="doctor1@vitalit.com",
                hashed_password=get_password_hash("doctor123"),
                role="doctor",
                is_active=True
            ),
            User(
                username="nurse1",
                email="nurse1@vitalit.com",
                hashed_password=get_password_hash("nurse123"),
                role="nurse",
                is_active=True
            ),
            User(
                username="receptionist1",
                email="receptionist1@vitalit.com",
                hashed_password=get_password_hash("receptionist123"),
                role="receptionist",
                is_active=True
            ),
            User(
                username="staff1",
                email="staff1@vitalit.com",
                hashed_password=get_password_hash("staff123"),
                role="staff",
                is_active=True
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Create doctors
        print("👨‍⚕️ Creating doctors...")
        doctors = [
            Doctor(
                doctor_id="D20250101001",
                first_name="Dr. John",
                last_name="Smith",
                specialization="Cardiology",
                qualification="MBBS, MD (Cardiology)",
                license_number="CARD001",
                phone="+1-555-0101",
                email="john.smith@vitalit.com",
                address="123 Medical Center Dr, Suite 100",
                consultation_fee=150.0,
                is_active=True
            ),
            Doctor(
                doctor_id="D20250101002",
                first_name="Dr. Sarah",
                last_name="Johnson",
                specialization="Pediatrics",
                qualification="MBBS, MD (Pediatrics)",
                license_number="PED001",
                phone="+1-555-0102",
                email="sarah.johnson@vitalit.com",
                address="123 Medical Center Dr, Suite 200",
                consultation_fee=120.0,
                is_active=True
            ),
            Doctor(
                doctor_id="D20250101003",
                first_name="Dr. Michael",
                last_name="Brown",
                specialization="Orthopedics",
                qualification="MBBS, MS (Orthopedics)",
                license_number="ORTH001",
                phone="+1-555-0103",
                email="michael.brown@vitalit.com",
                address="123 Medical Center Dr, Suite 300",
                consultation_fee=180.0,
                is_active=True
            ),
            Doctor(
                doctor_id="D20250101004",
                first_name="Dr. Emily",
                last_name="Davis",
                specialization="Dermatology",
                qualification="MBBS, MD (Dermatology)",
                license_number="DERM001",
                phone="+1-555-0104",
                email="emily.davis@vitalit.com",
                address="123 Medical Center Dr, Suite 400",
                consultation_fee=140.0,
                is_active=True
            )
        ]
        
        for doctor in doctors:
            db.add(doctor)
        db.commit()
        
        # Create patients
        print("👤 Creating patients...")
        patients = [
            Patient(
                patient_id="P20250101001",
                first_name="Alice",
                last_name="Wilson",
                date_of_birth=date(1985, 3, 15),
                gender=GenderEnum.FEMALE,
                blood_group="A+",
                address="456 Oak Street, City, State 12345",
                phone="+1-555-0201",
                email="alice.wilson@email.com",
                emergency_contact_name="Bob Wilson",
                emergency_contact_phone="+1-555-0202",
                emergency_contact_relationship="Spouse",
                insurance_provider="Blue Cross",
                insurance_number="BC123456789",
                allergies="Penicillin",
                medical_history="Hypertension, Diabetes Type 2"
            ),
            Patient(
                patient_id="P20250101002",
                first_name="Robert",
                last_name="Chen",
                date_of_birth=date(1990, 7, 22),
                gender=GenderEnum.MALE,
                blood_group="O+",
                address="789 Pine Avenue, City, State 12345",
                phone="+1-555-0203",
                email="robert.chen@email.com",
                emergency_contact_name="Lisa Chen",
                emergency_contact_phone="+1-555-0204",
                emergency_contact_relationship="Sister",
                insurance_provider="Aetna",
                insurance_number="AET987654321",
                allergies="None",
                medical_history="Asthma"
            ),
            Patient(
                patient_id="P20250101003",
                first_name="Maria",
                last_name="Garcia",
                date_of_birth=date(1978, 11, 8),
                gender=GenderEnum.FEMALE,
                blood_group="B+",
                address="321 Elm Road, City, State 12345",
                phone="+1-555-0205",
                email="maria.garcia@email.com",
                emergency_contact_name="Carlos Garcia",
                emergency_contact_phone="+1-555-0206",
                emergency_contact_relationship="Husband",
                insurance_provider="Cigna",
                insurance_number="CIG456789123",
                allergies="Sulfa drugs",
                medical_history="None"
            ),
            Patient(
                patient_id="P20250101004",
                first_name="David",
                last_name="Thompson",
                date_of_birth=date(1995, 4, 30),
                gender=GenderEnum.MALE,
                blood_group="AB+",
                address="654 Maple Lane, City, State 12345",
                phone="+1-555-0207",
                email="david.thompson@email.com",
                emergency_contact_name="Jennifer Thompson",
                emergency_contact_phone="+1-555-0208",
                emergency_contact_relationship="Mother",
                insurance_provider="UnitedHealth",
                insurance_number="UHC789123456",
                allergies="Peanuts",
                medical_history="Eczema"
            ),
            Patient(
                patient_id="P20250101005",
                first_name="Lisa",
                last_name="Anderson",
                date_of_birth=date(1982, 9, 12),
                gender=GenderEnum.FEMALE,
                blood_group="A-",
                address="987 Cedar Street, City, State 12345",
                phone="+1-555-0209",
                email="lisa.anderson@email.com",
                emergency_contact_name="Mark Anderson",
                emergency_contact_phone="+1-555-0210",
                emergency_contact_relationship="Brother",
                insurance_provider="Humana",
                insurance_number="HUM321654987",
                allergies="Shellfish",
                medical_history="Migraine, Anxiety"
            )
        ]
        
        for patient in patients:
            db.add(patient)
        db.commit()
        
        # Create appointments
        print("📅 Creating appointments...")
        today = datetime.now().date()
        appointments = [
            Appointment(
                appointment_id="APT20250101001",
                patient_id=1,
                doctor_id=1,
                scheduled_datetime=datetime.combine(today, datetime.min.time().replace(hour=9, minute=0)),
                duration_minutes=30,
                reason="Annual checkup",
                status=AppointmentStatusEnum.SCHEDULED,
                notes="Patient requested morning appointment",
                created_by=1
            ),
            Appointment(
                appointment_id="APT20250101002",
                patient_id=2,
                doctor_id=2,
                scheduled_datetime=datetime.combine(today, datetime.min.time().replace(hour=10, minute=30)),
                duration_minutes=45,
                reason="Follow-up for asthma",
                status=AppointmentStatusEnum.CONFIRMED,
                notes="Bring inhaler for review",
                created_by=1
            ),
            Appointment(
                appointment_id="APT20250101003",
                patient_id=3,
                doctor_id=3,
                scheduled_datetime=datetime.combine(today, datetime.min.time().replace(hour=14, minute=0)),
                duration_minutes=60,
                reason="Knee pain consultation",
                status=AppointmentStatusEnum.SCHEDULED,
                notes="Recent injury, needs X-ray",
                created_by=1
            ),
            Appointment(
                appointment_id="APT20250101004",
                patient_id=4,
                doctor_id=4,
                scheduled_datetime=datetime.combine(today, datetime.min.time().replace(hour=15, minute=30)),
                duration_minutes=30,
                reason="Skin rash",
                status=AppointmentStatusEnum.SCHEDULED,
                notes="Allergic reaction suspected",
                created_by=1
            )
        ]
        
        for appointment in appointments:
            db.add(appointment)
        db.commit()
        
        # Create medical records
        print("📋 Creating medical records...")
        medical_records = [
            MedicalRecord(
                record_id="MR20250101001",
                patient_id=1,
                doctor_id=1,
                appointment_id=1,
                visit_date=datetime.now(),
                chief_complaint="Annual checkup",
                diagnosis="Healthy, no issues found",
                treatment_plan="Continue current medications",
                prescription_notes="None",
                follow_up_date=date.today() + timedelta(days=365),
                created_by=2
            ),
            MedicalRecord(
                record_id="MR20250101002",
                patient_id=2,
                doctor_id=2,
                appointment_id=2,
                visit_date=datetime.now(),
                chief_complaint="Asthma symptoms",
                diagnosis="Mild asthma exacerbation",
                treatment_plan="Increase inhaler usage",
                prescription_notes="Albuterol inhaler",
                follow_up_date=date.today() + timedelta(days=30),
                created_by=2
            )
        ]
        
        for record in medical_records:
            db.add(record)
        db.commit()
        
        # Create vitals
        print("💓 Creating patient vitals...")
        vitals = [
            PatientVitals(
                medical_record_id=1,
                temperature=36.8,
                blood_pressure_systolic=120,
                blood_pressure_diastolic=80,
                heart_rate=72,
                respiratory_rate=16,
                weight=65.0,
                height=165.0,
                oxygen_saturation=98.0,
                notes="All vitals within normal range"
            ),
            PatientVitals(
                medical_record_id=2,
                temperature=37.2,
                blood_pressure_systolic=125,
                blood_pressure_diastolic=85,
                heart_rate=85,
                respiratory_rate=20,
                weight=70.0,
                height=175.0,
                oxygen_saturation=95.0,
                notes="Slightly elevated respiratory rate due to asthma"
            )
        ]
        
        for vital in vitals:
            db.add(vital)
        db.commit()
        
        # Create prescriptions
        print("💊 Creating prescriptions...")
        prescriptions = [
            Prescription(
                prescription_id="RX20250101001",
                patient_id=2,
                doctor_id=2,
                medical_record_id=2,
                prescribed_date=datetime.now(),
                diagnosis="Asthma exacerbation",
                instructions="Use as needed for shortness of breath",
                is_active=True
            )
        ]
        
        for prescription in prescriptions:
            db.add(prescription)
        db.commit()
        
        # Create prescription items
        print("💊 Creating prescription items...")
        prescription_items = [
            PrescriptionItem(
                prescription_id=1,
                medication_name="Albuterol Inhaler",
                dosage="2 puffs",
                frequency="As needed",
                duration="30 days",
                instructions="Shake well before use, wait 1 minute between puffs",
                quantity=1
            )
        ]
        
        for item in prescription_items:
            db.add(item)
        db.commit()
        
        # Create bills
        print("💰 Creating bills...")
        bills = [
            Bill(
                bill_id="BILL20250101001",
                patient_id=1,
                appointment_id=1,
                bill_date=datetime.now(),
                due_date=datetime.now() + timedelta(days=30),
                subtotal=150.0,
                tax_amount=12.0,
                discount_amount=0.0,
                total_amount=162.0,
                paid_amount=0.0,
                payment_status=PaymentStatusEnum.PENDING,
                notes="Annual checkup consultation"
            ),
            Bill(
                bill_id="BILL20250101002",
                patient_id=2,
                appointment_id=2,
                bill_date=datetime.now(),
                due_date=datetime.now() + timedelta(days=30),
                subtotal=120.0,
                tax_amount=9.6,
                discount_amount=10.0,
                total_amount=119.6,
                paid_amount=119.6,
                payment_status=PaymentStatusEnum.PAID,
                notes="Follow-up consultation"
            )
        ]
        
        for bill in bills:
            db.add(bill)
        db.commit()
        
        # Create bill items
        print("💰 Creating bill items...")
        bill_items = [
            BillItem(
                bill_id=1,
                item_name="Cardiology Consultation",
                description="Annual checkup with cardiologist",
                quantity=1,
                unit_price=150.0,
                total_price=150.0
            ),
            BillItem(
                bill_id=2,
                item_name="Pediatrics Consultation",
                description="Follow-up consultation for asthma",
                quantity=1,
                unit_price=120.0,
                total_price=120.0
            )
        ]
        
        for item in bill_items:
            db.add(item)
        db.commit()
        
        # Create payments
        print("💳 Creating payments...")
        payments = [
            Payment(
                payment_id="PAY20250101001",
                bill_id=2,
                amount=119.6,
                payment_method="card",
                payment_date=datetime.now(),
                reference_number="TXN123456789",
                notes="Paid in full"
            )
        ]
        
        for payment in payments:
            db.add(payment)
        db.commit()
        
        # Create inventory items
        print("📦 Creating inventory items...")
        inventory_items = [
            InventoryItem(
                item_id="INV20250101001",
                name="Paracetamol 500mg",
                description="Pain relief tablets",
                category="medicine",
                unit="tablets",
                current_quantity=1000,
                minimum_quantity=100,
                maximum_quantity=2000,
                unit_price=0.5,
                supplier="PharmaCorp",
                expiry_date=date.today() + timedelta(days=365),
                location="Medicine Cabinet A",
                is_active=True
            ),
            InventoryItem(
                item_id="INV20250101002",
                name="Surgical Masks",
                description="Disposable surgical masks",
                category="supplies",
                unit="boxes",
                current_quantity=50,
                minimum_quantity=10,
                maximum_quantity=100,
                unit_price=25.0,
                supplier="MedSupply Inc",
                expiry_date=date.today() + timedelta(days=730),
                location="Storage Room B",
                is_active=True
            ),
            InventoryItem(
                item_id="INV20250101003",
                name="Blood Pressure Monitor",
                description="Digital BP monitor",
                category="equipment",
                unit="pieces",
                current_quantity=5,
                minimum_quantity=2,
                maximum_quantity=10,
                unit_price=150.0,
                supplier="MedEquip Ltd",
                expiry_date=None,
                location="Equipment Room",
                is_active=True
            )
        ]
        
        for item in inventory_items:
            db.add(item)
        db.commit()
        
        # Create inventory transactions
        print("📦 Creating inventory transactions...")
        transactions = [
            InventoryTransaction(
                transaction_id="TXN20250101001",
                item_id=1,
                transaction_type="in",
                quantity=1000,
                unit_price=0.5,
                total_amount=500.0,
                reference_number="PO123456",
                notes="Initial stock",
                created_by=1
            ),
            InventoryTransaction(
                transaction_id="TXN20250101002",
                item_id=2,
                transaction_type="in",
                quantity=50,
                unit_price=25.0,
                total_amount=1250.0,
                reference_number="PO123457",
                notes="Initial stock",
                created_by=1
            ),
            InventoryTransaction(
                transaction_id="TXN20250101003",
                item_id=3,
                transaction_type="in",
                quantity=5,
                unit_price=150.0,
                total_amount=750.0,
                reference_number="PO123458",
                notes="Initial stock",
                created_by=1
            )
        ]
        
        for transaction in transactions:
            db.add(transaction)
        db.commit()
        
        print("✅ Seed data created successfully!")
        print(f"📊 Summary:")
        print(f"   - Users: {len(users)}")
        print(f"   - Doctors: {len(doctors)}")
        print(f"   - Patients: {len(patients)}")
        print(f"   - Appointments: {len(appointments)}")
        print(f"   - Medical Records: {len(medical_records)}")
        print(f"   - Prescriptions: {len(prescriptions)}")
        print(f"   - Bills: {len(bills)}")
        print(f"   - Inventory Items: {len(inventory_items)}")
        
    except Exception as e:
        print(f"❌ Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data() 