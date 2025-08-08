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
from backend.core.database import get_db as get_db_ctx
from backend.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Redis if enabled
redis_client: Optional[Redis] = None
if settings.REDIS_ENABLED:
    try:
        redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            ssl=settings.REDIS_SSL,
            db=settings.REDIS_DB,
            decode_responses=True,
        )
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}")
        logger.info("Running without Redis cache")
        redis_client = None

# Security configuration
SECRET_KEY = settings.TOKEN_SECRET_KEY
ALGORITHM = settings.TOKEN_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Security contexts
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# Token configuration
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
TOKEN_ALGORITHM = settings.TOKEN_ALGORITHM
TOKEN_SECRET_KEY = settings.TOKEN_SECRET_KEY
REFRESH_TOKEN_SECRET_KEY = settings.REFRESH_TOKEN_SECRET_KEY

# Security policy
FAILED_LOGIN_LIMIT = 5
LOCKOUT_DURATION_MINUTES = 15
PASSWORD_MIN_LENGTH = 12
MFA_ENABLED = settings.MFA_ENABLED


def _make_mock_user(username: str = "admin", role: str = "admin") -> models.User:
    """Create a transient mock user for test/dev mode without DB access."""
    return models.User(
        id=1,
        username=username,
        email=f"{username}@vitalit.com",
        role=role,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=None,
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token using python-jose."""
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
        return schemas.TokenData(username=username, user_id=user_id, role=role)
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
    db: Session = Depends(get_db_ctx),
) -> Optional[models.User]:
    """Get the current authenticated user or None if unauthenticated.

    In test_mode, return a mock admin user when no credentials are supplied
    to keep local/dev UX smooth.
    """
    if settings.test_mode and not credentials:
        return _make_mock_user()

    if not credentials:
        return None

    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        if token_data.user_id == 1:
            return _make_mock_user(token_data.username or "admin", token_data.role or "admin")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return user


def get_current_active_user(
    current_user: Optional[models.User] = Depends(get_current_user),
) -> models.User:
    if current_user is None:
        if settings.test_mode:
            return _make_mock_user()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return current_user


def require_role(required_roles: Union[str, list[str]]):
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def role_checker(current_user: models.User = Depends(get_current_active_user)) -> models.User:
        if settings.test_mode and current_user is None:
            return _make_mock_user()
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}",
            )
        return current_user

    return role_checker


require_admin = require_role("admin")
require_doctor = require_role(["admin", "doctor"])
require_nurse = require_role(["admin", "doctor", "nurse"])
require_receptionist = require_role(["admin", "receptionist"])
require_staff = require_role(["admin", "doctor", "nurse", "receptionist", "staff"])


def generate_patient_id() -> str:
    return f"P{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_doctor_id() -> str:
    return f"D{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_appointment_id() -> str:
    return f"A{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_bill_id() -> str:
    return f"B{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_prescription_id() -> str:
    return f"PR{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_inventory_id() -> str:
    return f"I{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_payment_id() -> str:
    return f"PAY{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_transaction_id() -> str:
    return f"T{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}"


def generate_record_id() -> str:
    return f"R{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}" 