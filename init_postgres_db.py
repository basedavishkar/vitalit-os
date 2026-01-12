#!/usr/bin/env python3
"""
Initialize PostgreSQL database with all tables and create a default admin user.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / 'backend' / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from: {env_path}")
else:
    print(f"⚠️  .env file not found at: {env_path}")

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from backend.core.database import Base, engine
from backend.models import (
    User, UserSession, AuditLog,
    Patient, PatientDocument,
    Doctor,
    Appointment,
    Bill, BillItem, Payment, InsuranceClaim
)
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def init_database():
    """Create all tables in the database."""
    print("🏥 Initializing VITALit OS Database...")
    print(f"📍 Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    print("=" * 60)
    
    try:
        # Drop all tables (optional - comment out if you want to keep existing data)
        # print("⚠️  Dropping existing tables...")
        # Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # List all created tables
        print("\n✅ Successfully created tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"   ✓ {table_name}")
        
        print("\n" + "=" * 60)
        print("✅ Database initialization complete!")
        
        # Create default admin user if it doesn't exist
        create_default_user()
        
    except Exception as e:
        print(f"\n❌ Error initializing database: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def create_default_user():
    """Create a default admin user if none exists."""
    print("\n👤 Checking for default admin user...")
    
    try:
        with Session(engine) as db:
            # Check if any users exist
            existing_user = db.query(User).filter(User.username == "admin").first()
            
            if existing_user:
                print("   ℹ️  Admin user already exists")
            else:
                # Create default admin user
                admin_user = User(
                    username="admin",
                    email="admin@hospital.com",
                    hashed_password=get_password_hash("admin123"),
                    role="admin",
                    is_active=True
                )
                db.add(admin_user)
                db.commit()
                print("   ✅ Created default admin user:")
                print("      Username: admin")
                print("      Password: admin123")
                print("      ⚠️  Please change this password after first login!")
                
            # Check for doctor user
            doctor_user = db.query(User).filter(User.username == "doctor").first()
            if not doctor_user:
                doctor_user = User(
                    username="doctor",
                    email="doctor@hospital.com",
                    hashed_password=get_password_hash("doctor123"),
                    role="doctor",
                    is_active=True
                )
                db.add(doctor_user)
                db.commit()
                print("   ✅ Created default doctor user:")
                print("      Username: doctor")
                print("      Password: doctor123")
                
    except Exception as e:
        print(f"   ❌ Error creating default users: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_database()

