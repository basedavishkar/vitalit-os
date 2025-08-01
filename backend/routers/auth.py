import os
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend import database, models, schemas, auth, audit

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security contexts
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Router
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Role credentials mapping - simple approach for your requirement
ROLE_CREDENTIALS = {
    "admin": "admin123",
    "doctor": "doctor123", 
    "staff": "staff123"
}

# Utility functions
def get_password_hash(password: str) -> str:
    """Hash a password for secure storage."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Authentication endpoint
@router.post("/login", response_model=schemas.Token)
async def login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Authenticate user and return access token."""
    
    # Authenticate user
    user = auth.authenticate_user(db, login_data.username, login_data.password)
    
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
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
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
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": schemas.User.from_orm(user)
    }

@router.post("/logout")
async def logout(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Logout user and invalidate token."""
    
    # Log logout
    audit.AuditLogger.log_logout(db, current_user.id, request)
    
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=schemas.User)
async def get_current_user_info(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get current user information."""
    return current_user

@router.post("/users", response_model=schemas.User)
async def create_user(
    user_data: schemas.UserCreate,
    current_user: models.User = Depends(auth.require_admin),
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
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all users (admin only)."""
    
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    current_user: models.User = Depends(auth.require_admin),
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
    current_user: models.User = Depends(auth.require_admin),
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
    update_data = user_data.dict(exclude_unset=True)
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
    current_user: models.User = Depends(auth.require_admin),
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
    current_user: models.User = Depends(auth.require_admin),
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
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Change own password."""
    
    # Verify current password
    if not auth.verify_password(current_password, current_user.hashed_password):
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
    current_user: models.User = Depends(auth.require_admin),
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
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get user activity summary (admin only)."""
    
    activity = audit.get_user_activity_summary(db, user_id, days)
    return activity

@router.post("/export-audit-logs")
async def export_audit_logs(
    format: str = "json",
    current_user: models.User = Depends(auth.require_admin),
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
