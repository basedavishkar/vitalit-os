import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend import models, schemas
from backend.core import database, security
from backend.core.config import settings
from backend import audit

# Router
router = APIRouter(prefix="/auth", tags=["Authentication"])
security_scheme = HTTPBearer()

# Role credentials mapping - simple approach for your requirement
ROLE_CREDENTIALS = {
    "admin": "admin123",
    "doctor": "doctor123", 
    "staff": "staff123"
}

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Utility functions
def get_password_hash(password: str) -> str:
    """Hash a password for secure storage."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    return security.create_access_token(data, expires_delta)


# Registration endpoint
@router.post("/register", response_model=schemas.User, status_code=201)
async def register_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Register a new user."""
    
    # Check if username already exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log user registration
    audit.AuditLogger.log_action(
        db, db_user.id, "USER_REGISTERED", "users",
        record_id=db_user.id,
        new_values={"username": user_data.username, "email": user_data.email},
        request=request
    )
    
    return db_user


# Authentication endpoint
@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Authenticate user and return access token."""
    
    # For development, check against role credentials first
    if form_data.username in ROLE_CREDENTIALS and ROLE_CREDENTIALS[form_data.username] == form_data.password:
        # Create a simple token for development
        token_data = {
            "sub": form_data.username,
            "user_id": 1,
            "role": form_data.username
        }
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(token_data, access_token_expires)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
            "user": {
                "id": 1,
                "username": form_data.username,
                "email": f"{form_data.username}@vitalit.com",
                "role": form_data.username,
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": None
            }
        }
    
    # Authenticate user against database
    user = security.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        # Log failed login attempt
        audit.AuditLogger.log_login(db, 0, False, request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        audit.AuditLogger.log_login(db, user.id, False, request)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    # Log successful login
    audit.AuditLogger.log_login(db, user.id, True, request)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": schemas.User.model_validate(user)
    }


# Token endpoint for OAuth2 compatibility
@router.post("/token", response_model=schemas.Token)
async def get_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Get access token (OAuth2 compatibility endpoint)."""
    return await login(form_data, db, request)

@router.post("/logout")
async def logout(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Logout user and invalidate token."""
    
    try:
        # Log logout only if user exists in database
        if current_user and hasattr(current_user, 'id') and current_user.id:
            audit.AuditLogger.log_logout(db, current_user.id, request)
    except Exception as e:
        # For development tokens, skip audit logging
        print(f"Audit logging skipped for development token: {e}")
    
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=schemas.User)
async def get_current_user_info(
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get current user information."""
    return current_user

@router.post("/users", response_model=schemas.User)
async def create_user(
    user_data: schemas.UserCreate,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new user (admin only)."""
    
    # Check if username already exists
    existing_user = db.query(models.User).filter(
        models.User.username == user_data.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log user creation
    audit.AuditLogger.log_create(
        db, current_user.id, "users", db_user.id,
        {"username": user_data.username, "email": user_data.email, "role": user_data.role},
        request
    )
    
    return db_user

@router.get("/users", response_model=List[schemas.User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all users (admin only)."""
    
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get user by ID (admin only)."""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_data: schemas.UserUpdate,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update user (admin only)."""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store old values for audit
    old_values = {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }
    
    # Update user fields
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Log user update
    audit.AuditLogger.log_update(
        db, current_user.id, "users", user.id,
        old_values, update_data, request
    )
    
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete user (admin only)."""
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store old values for audit
    old_values = {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }
    
    # Delete user
    db.delete(user)
    db.commit()
    
    # Log user deletion
    audit.AuditLogger.log_delete(
        db, current_user.id, "users", user_id,
        old_values, request
    )
    
    return {"message": "User deleted successfully"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Reset user password (admin only)."""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    
    # Log password reset
    audit.AuditLogger.log_update(
        db, current_user.id, "users", user.id,
        {"password": "***"}, {"password": "***"}, request
    )
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
async def change_own_password(
    current_password: str,
    new_password: str,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Change own password."""
    
    # Verify current password
    if not security.verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(current_user)
    
    # Log password change
    audit.AuditLogger.log_update(
        db, current_user.id, "users", current_user.id,
        {"password": "***"}, {"password": "***"}, request
    )
    
    return {"message": "Password changed successfully"}

@router.get("/audit-logs")
async def get_audit_logs(
    user_id: int = None,
    action: str = None,
    table_name: str = None,
    limit: int = 100,
    offset: int = 0,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get audit logs (admin only)."""
    
    logs = audit.get_audit_logs(
        db, user_id=user_id, action=action,
        table_name=table_name, limit=limit, offset=offset
    )
    
    return logs

@router.get("/user-activity/{user_id}")
async def get_user_activity(
    user_id: int,
    days: int = 30,
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get user activity summary (admin only)."""
    
    activity = audit.get_user_activity_summary(db, user_id, days)
    return activity

@router.post("/export-audit-logs")
async def export_audit_logs(
    format: str = "json",
    current_user: models.User = Depends(security.require_admin),
    db: Session = Depends(database.get_db)
):
    """Export audit logs (admin only)."""
    
    try:
        exported_data = audit.export_audit_logs(db, format=format)
        return {"data": exported_data, "format": format}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
