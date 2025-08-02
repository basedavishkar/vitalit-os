import os
import secrets
import re
from datetime import datetime, timedelta
from typing import Optional, Union, Tuple
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import pyotp
import qrcode
from io import BytesIO
import base64

from . import models, schemas, database
from .config import settings

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer(auto_error=False)


class PasswordValidator:
    """Password strength validator"""
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """Validate password strength"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r"[A-Z]", password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r"[a-z]", password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r"\d", password):
            return False, "Password must contain at least one digit"
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is strong"


class MFAManager:
    """Multi-factor authentication manager"""
    
    @staticmethod
    def generate_mfa_secret() -> str:
        """Generate a new MFA secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(username: str, secret: str) -> str:
        """Generate QR code for MFA setup"""
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=username,
            issuer_name="Vitalit OS"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode()
    
    @staticmethod
    def verify_totp(secret: str, token: str) -> bool:
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token)


class SessionManager:
    """Session management"""
    
    @staticmethod
    def create_session(
        db: Session, 
        user: models.User, 
        request: Request
    ) -> models.UserSession:
        """Create a new user session"""
        session_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        session = models.UserSession(
            user_id=user.id,
            session_token=session_token,
            refresh_token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def get_session(db: Session, session_token: str) -> Optional[models.UserSession]:
        """Get active session by token"""
        return db.query(models.UserSession).filter(
            models.UserSession.session_token == session_token,
            models.UserSession.is_active == True,
            models.UserSession.expires_at > datetime.utcnow()
        ).first()
    
    @staticmethod
    def revoke_session(db: Session, session_token: str) -> bool:
        """Revoke a session"""
        session = db.query(models.UserSession).filter(
            models.UserSession.session_token == session_token
        ).first()
        
        if session:
            session.is_active = False
            db.commit()
            return True
        return False
    
    @staticmethod
    def revoke_all_sessions(db: Session, user_id: int) -> bool:
        """Revoke all sessions for a user"""
        sessions = db.query(models.UserSession).filter(
            models.UserSession.user_id == user_id,
            models.UserSession.is_active == True
        ).all()
        
        for session in sessions:
            session.is_active = False
        
        db.commit()
        return True


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, secret_key: str = SECRET_KEY) -> Optional[schemas.TokenData]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
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


def check_account_lockout(user: models.User) -> bool:
    """Check if user account is locked"""
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False


def handle_failed_login(db: Session, user: models.User) -> None:
    """Handle failed login attempt"""
    user.failed_login_attempts += 1
    
    if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    
    db.commit()


def reset_failed_attempts(db: Session, user: models.User) -> None:
    """Reset failed login attempts"""
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    db.commit()


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Authenticate a user with username and password"""
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if not user:
        return None
    
    if not user.is_active:
        return None
    
    if check_account_lockout(user):
        return None
    
    if not verify_password(password, user.hashed_password):
        handle_failed_login(db, user)
        return None
    
    reset_failed_attempts(db, user)
    return user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(database.get_db)
) -> Optional[models.User]:
    """Get the current authenticated user"""
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
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(
    current_user: Optional[models.User] = Depends(get_current_user)
) -> models.User:
    """Get the current active user"""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return current_user


def require_role(required_roles: Union[str, list[str]]):
    """Require specific role(s) for access"""
    def role_checker(current_user: models.User = Depends(get_current_active_user)) -> models.User:
        if isinstance(required_roles, str):
            required_roles_list = [required_roles]
        else:
            required_roles_list = required_roles
        
        if current_user.role not in required_roles_list:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker


# Role-specific dependencies
require_admin = require_role("admin")
require_doctor = require_role(["admin", "doctor"])
require_nurse = require_role(["admin", "doctor", "nurse"])
require_staff = require_role(["admin", "doctor", "nurse", "receptionist", "staff"]) 