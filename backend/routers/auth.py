import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend import database, models, schemas

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security contexts
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Router
router = APIRouter(prefix="/auth", tags=["authentication"])

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
@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """
    Login with role as username and corresponding password.
    Valid roles: admin, doctor, staff
    """
    role = form_data.username.lower()
    password = form_data.password
    
    # Check if role exists and password matches
    if role not in ROLE_CREDENTIALS or ROLE_CREDENTIALS[role] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid role or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token with role information
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": role, "role": role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency functions
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Extract and validate user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("sub")
        if role is None or role not in ROLE_CREDENTIALS:
            raise credentials_exception
        return {"role": role, "username": role}
    except JWTError:
        raise credentials_exception

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """Get the current active user."""
    return current_user

def require_role(required_role: str):
    """Dependency factory for role-based access control."""
    def role_checker(current_user: dict = Depends(get_current_active_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role} role required.",
            )
        return current_user
    return role_checker
