#!/usr/bin/env python3
"""Simple script to create admin user."""

from passlib.context import CryptContext
from database import SessionLocal
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    """Create admin user."""
    db = SessionLocal()
    
    # Check if admin exists
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        print("Admin user already exists")
        return
    
    # Create admin
    hashed_password = pwd_context.hash("admin123")
    admin = User(
        username="admin",
        email="admin@vitalit.com",
        hashed_password=hashed_password,
        role="admin",
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    print("Admin user created!")
    print("Username: admin")
    print("Password: admin123")

if __name__ == "__main__":
    create_admin() 