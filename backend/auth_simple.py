import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from . import models, schemas, database

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Authenticate a user with username and password."""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(database.get_db)
) -> models.User:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # For now, just return a mock user
    # In a real implementation, you would decode the JWT token
    user = db.query(models.User).filter(models.User.username == "admin").first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def require_role(required_roles: Union[str, list[str]]):
    """Decorator to require specific roles for access."""
    if isinstance(required_roles, str):
        required_roles = [required_roles]
    
    def role_checker(current_user: models.User = Depends(get_current_active_user)) -> models.User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    
    return role_checker

# Role-based dependencies
require_admin = require_role("admin")
require_doctor = require_role(["admin", "doctor"])
require_nurse = require_role(["admin", "doctor", "nurse"])
require_receptionist = require_role(["admin", "receptionist"])
require_staff = require_role(["admin", "doctor", "nurse", "receptionist", "staff"])

def generate_patient_id() -> str:
    """Generate a unique patient ID."""
    return f"P{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_doctor_id() -> str:
    """Generate a unique doctor ID."""
    return f"D{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_appointment_id() -> str:
    """Generate a unique appointment ID."""
    return f"APT{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_bill_id() -> str:
    """Generate a unique bill ID."""
    return f"BILL{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_prescription_id() -> str:
    """Generate a unique prescription ID."""
    return f"RX{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_inventory_id() -> str:
    """Generate a unique inventory item ID."""
    return f"INV{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_payment_id() -> str:
    """Generate a unique payment ID."""
    return f"PAY{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_transaction_id() -> str:
    """Generate a unique transaction ID."""
    return f"TXN{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"

def generate_record_id() -> str:
    """Generate a unique medical record ID."""
    return f"MR{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}" 