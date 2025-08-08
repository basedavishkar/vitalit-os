from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import logging
from redis import Redis
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.core import database
from backend.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Security contexts
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Redis client for token management
redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    ssl=settings.REDIS_SSL,
    decode_responses=True
)

# Token configuration
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
TOKEN_ALGORITHM = settings.TOKEN_ALGORITHM
TOKEN_SECRET_KEY = settings.TOKEN_SECRET_KEY
REFRESH_TOKEN_SECRET_KEY = settings.REFRESH_TOKEN_SECRET_KEY

# Security configuration
FAILED_LOGIN_LIMIT = 5
LOCKOUT_DURATION_MINUTES = 15
PASSWORD_MIN_LENGTH = 12
MFA_ENABLED = settings.MFA_ENABLED

# Security scheme
security = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token using PyJWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[schemas.TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        
        if username is None:
            return None
        
        return schemas.TokenData(
            username=username,
            user_id=user_id,
            role=role
        )
    except JWTError:
        return None


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Authenticate a user with username and password."""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(database.get_db)
) -> Optional[models.User]:
    """Get the current authenticated user."""
    # In test mode, return None to allow public access
    if settings.test_mode:
        return None
    
    if not credentials:
        return None
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    # For development tokens, create a mock user if not found in database
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        # Check if this is a development token (user_id = 1)
        if token_data.user_id == 1:
            # Create a mock user for development
            from datetime import datetime
            mock_user = models.User(
                id=1,
                username=token_data.username,
                email=f"{token_data.username}@vitalit.com",
                role=token_data.role,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=None
            )
            return mock_user
        else:
            raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(current_user: Optional[models.User] = Depends(get_current_user)) -> models.User:
    """Get the current active user."""
    # In test mode, allow access without authentication
    if settings.test_mode:
        return None
    
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
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
        # In test mode, allow access without authentication
        if settings.test_mode or current_user is None:
            return None
        
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
    return f"A{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_bill_id() -> str:
    """Generate a unique bill ID."""
    return f"B{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_prescription_id() -> str:
    """Generate a unique prescription ID."""
    return f"PR{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_inventory_id() -> str:
    """Generate a unique inventory ID."""
    return f"I{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_payment_id() -> str:
    """Generate a unique payment ID."""
    return f"PAY{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_transaction_id() -> str:
    """Generate a unique transaction ID."""
    return f"T{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_record_id() -> str:
    """Generate a unique record ID."""
    return f"R{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}" 