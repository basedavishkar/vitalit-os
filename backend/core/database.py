import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Get database configuration from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hospital.db")
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"  # Default to True for development
TESTING = os.getenv("TESTING", "false").lower() == "true"

# Configure engine based on database type
engine_config = {
    "echo": DEV_MODE,  # Log SQL in development mode
}

if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL specific configuration
    engine_config.update({
        "pool_size": int(os.getenv("DB_POOL_SIZE", "20")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
        "pool_pre_ping": True,  # Enable connection health checks
        "pool_recycle": 3600,   # Recycle connections after 1 hour
        "poolclass": QueuePool,
    })
elif DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration
    if not (DEV_MODE or TESTING):
        raise ValueError("SQLite should only be used in development/testing")
    engine_config.update({
        "connect_args": {"check_same_thread": False},  # Allow multiple threads to access SQLite
        "pool_size": 1,
        "max_overflow": 0,
    })

engine = create_engine(DATABASE_URL, **engine_config)

# Configure session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI dependency
def get_db():
    """Yield a database session and ensure proper cleanup."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()

# SQLite specific optimizations (for development only)
if "sqlite" in DATABASE_URL:
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

# Initialize database (if not testing)
def init_db():
    """Initialize database schema."""
    try:
        if not TESTING:
            Base.metadata.create_all(bind=engine)
            logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

# Call initialization
init_db()
