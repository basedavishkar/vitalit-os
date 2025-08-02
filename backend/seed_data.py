#!/usr/bin/env python3
"""
Seed data script for VITALIt-OS
Populates the database with initial users, patients, doctors, and sample data.
"""

import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import (
    User, Patient, Doctor, Appointment, MedicalRecord, 
    PatientVitals, Prescription, PrescriptionItem, Bill, 
    BillItem, Payment, InventoryItem, InventoryTransaction,
    GenderEnum, PaymentStatusEnum, AppointmentStatusEnum
)
from auth import get_password_hash
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create a default admin user for testing."""
    db = next(SessionLocal())
    
    # Check if admin user already exists
    existing_user = db.query(User).filter(User.username == "admin").first()
    if existing_user:
        print("Admin user already exists")
        return
    
    # Create admin user
    hashed_password = pwd_context.hash("admin123")
    admin_user = User(
        username="admin",
        email="admin@vitalit.com",
        hashed_password=hashed_password,
        role="admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    print("Admin user created successfully")
    print("Username: admin")
    print("Password: admin123")

if __name__ == "__main__":
    create_admin_user() 