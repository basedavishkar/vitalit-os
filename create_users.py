#!/usr/bin/env python3
"""
Script to create test users for VITALIt-OS authentication system.
Run this script to add default users to the database.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database import engine, SessionLocal
from backend.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_test_users():
    db = SessionLocal()
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Found {existing_users} existing users in the database.")
            response = input("Do you want to add more users? (y/n): ").lower()
            if response != 'y':
                print("Skipping user creation.")
                return

        # Create admin user
        admin_user = User(
            role="admin",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        
        # Create doctor user
        doctor_user = User(
            role="doctor",
            hashed_password=get_password_hash("doctor123"),
            is_active=True
        )
        
        # Create staff user
        staff_user = User(
            role="staff",
            hashed_password=get_password_hash("staff123"),
            is_active=True
        )

        # Add users to database
        db.add(admin_user)
        db.add(doctor_user)
        db.add(staff_user)
        db.commit()
        
        print("✅ Test users created successfully!")
        print("👤 Admin: username=admin, password=admin123, role=admin")
        print("👨‍⚕️ Doctor: username=doctor, password=doctor123, role=doctor")
        print("👥 Staff: username=staff, password=staff123, role=staff")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test users for VITALIt-OS...")
    create_test_users()
