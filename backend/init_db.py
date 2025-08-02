#!/usr/bin/env python3
"""Initialize database and create tables."""

from database import engine
from models import Base

def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 