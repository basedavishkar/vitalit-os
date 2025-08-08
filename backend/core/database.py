import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Get database configuration from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vitalit")
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))

# Development mode check
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
TESTING = os.getenv("TESTING", "false").lower() == "true"

# Create engine with proper configuration
engine_config = {
    "pool_size": DB_POOL_SIZE,
    "max_overflow": DB_MAX_OVERFLOW,
    "pool_timeout": DB_POOL_TIMEOUT,
    "pool_pre_ping": True,  # Enable connection health checks
    "pool_recycle": 3600,   # Recycle connections after 1 hour
    "echo": DEV_MODE,       # Log SQL in development mode
    "poolclass": QueuePool
}

# For SQLite (development/testing only)
if "sqlite" in DATABASE_URL:
    if not (DEV_MODE or TESTING):
        raise ValueError("SQLite should only be used in development/testing")
    engine_config.update({
        "connect_args": {"check_same_thread": False},
        "pool_size": 1,
        "max_overflow": 0
    })

engine = create_engine(DATABASE_URL, **engine_config)

# Configure session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Connection management
@contextmanager
def get_db():
    """Database session context manager with automatic rollback on error."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
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
