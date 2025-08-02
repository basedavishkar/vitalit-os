import secrets
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend import database, models, schemas, audit
from backend.auth_enhanced import (
    authenticate_user, get_current_active_user, require_admin,
    PasswordValidator, MFAManager, SessionManager,
    create_access_token, create_refresh_token, get_password_hash,
    verify_password, verify_token, REFRESH_SECRET_KEY
)

router = APIRouter(prefix="/auth", tags=["Enhanced Authentication"])


@router.post("/login", response_model=schemas.LoginResponse)
async def login(
    login_data: schemas.LoginRequest,
    request: Request,
    db: Session = Depends(database.get_db)
):
    """Enhanced login with MFA support"""
    user = authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if MFA is required
    if user.mfa_enabled:
        return schemas.LoginResponse(
            access_token="",
            refresh_token="",
            expires_in=0,
            user=user,
            requires_mfa=True
        )
    
    # Create session and tokens
    session = SessionManager.create_session(db, user, request)
    
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role}
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    # Log successful login
    audit.AuditLogger.log_action(
        db, user.id, "LOGIN_SUCCESS", "users",
        record_id=user.id,
        new_values={"ip_address": request.client.host},
        request=request
    )
    
    return schemas.LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,  # 30 minutes
        user=user,
        requires_mfa=False
    )


@router.post("/login/mfa", response_model=schemas.LoginResponse)
async def login_with_mfa(
    mfa_data: schemas.MFAVerifyRequest,
    login_data: schemas.LoginRequest,
    request: Request,
    db: Session = Depends(database.get_db)
):
    """Login with MFA verification"""
    user = authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA not enabled for this user"
        )
    
    # Verify MFA token
    if not MFAManager.verify_totp(user.mfa_secret, mfa_data.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA token"
        )
    
    # Create session and tokens
    session = SessionManager.create_session(db, user, request)
    
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role}
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    # Log successful MFA login
    audit.AuditLogger.log_action(
        db, user.id, "LOGIN_MFA_SUCCESS", "users",
        record_id=user.id,
        new_values={"ip_address": request.client.host},
        request=request
    )
    
    return schemas.LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,
        user=user,
        requires_mfa=False
    )


@router.post("/refresh", response_model=schemas.LoginResponse)
async def refresh_token(
    refresh_data: schemas.RefreshTokenRequest,
    db: Session = Depends(database.get_db)
):
    """Refresh access token using refresh token"""
    token_data = verify_token(refresh_data.refresh_token, REFRESH_SECRET_KEY)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role}
    )
    
    return schemas.LoginResponse(
        access_token=access_token,
        refresh_token=refresh_data.refresh_token,
        expires_in=30 * 60,
        user=user,
        requires_mfa=False
    )


@router.post("/logout")
async def logout(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Logout and revoke current session"""
    # Get current session token from request
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
        # Find and revoke session
        session = SessionManager.get_session(db, token)
        if session:
            SessionManager.revoke_session(db, token)
    
    # Log logout
    audit.AuditLogger.log_action(
        db, current_user.id, "LOGOUT", "users",
        record_id=current_user.id,
        request=request
    )
    
    return {"message": "Logged out successfully"}


@router.post("/logout/all")
async def logout_all_sessions(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Logout from all sessions"""
    SessionManager.revoke_all_sessions(db, current_user.id)
    
    # Log logout all
    audit.AuditLogger.log_action(
        db, current_user.id, "LOGOUT_ALL", "users",
        record_id=current_user.id,
        request=request
    )
    
    return {"message": "Logged out from all sessions"}


@router.post("/mfa/setup", response_model=schemas.MFASetupResponse)
async def setup_mfa(
    mfa_data: schemas.MFASetupRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Setup MFA for user"""
    if mfa_data.enable:
        if current_user.mfa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA already enabled"
            )
        
        # Generate MFA secret and QR code
        secret = MFAManager.generate_mfa_secret()
        qr_code = MFAManager.generate_qr_code(current_user.username, secret)
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
        
        # Update user (secret will be saved after verification)
        current_user.mfa_secret = secret
        
        # Log MFA setup initiation
        audit.AuditLogger.log_action(
            db, current_user.id, "MFA_SETUP_INITIATED", "users",
            record_id=current_user.id,
            request=request
        )
        
        return schemas.MFASetupResponse(
            secret=secret,
            qr_code=qr_code,
            backup_codes=backup_codes
        )
    else:
        if not current_user.mfa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA not enabled"
            )
        
        # Disable MFA
        current_user.mfa_enabled = False
        current_user.mfa_secret = None
        db.commit()
        
        # Log MFA disable
        audit.AuditLogger.log_action(
            db, current_user.id, "MFA_DISABLED", "users",
            record_id=current_user.id,
            request=request
        )
        
        return {"message": "MFA disabled successfully"}


@router.post("/mfa/verify")
async def verify_mfa_setup(
    mfa_data: schemas.MFAVerifyRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Verify MFA setup and enable it"""
    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup not initiated"
        )
    
    if not MFAManager.verify_totp(current_user.mfa_secret, mfa_data.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA token"
        )
    
    # Enable MFA
    current_user.mfa_enabled = True
    db.commit()
    
    # Log MFA enabled
    audit.AuditLogger.log_action(
        db, current_user.id, "MFA_ENABLED", "users",
        record_id=current_user.id,
        request=request
    )
    
    return {"message": "MFA enabled successfully"}


@router.post("/change-password")
async def change_password(
    password_data: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Change user password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    is_valid, message = PasswordValidator.validate_password(password_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.password_changed_at = datetime.utcnow()
    db.commit()
    
    # Revoke all sessions
    SessionManager.revoke_all_sessions(db, current_user.id)
    
    # Log password change
    audit.AuditLogger.log_action(
        db, current_user.id, "PASSWORD_CHANGED", "users",
        record_id=current_user.id,
        request=request
    )
    
    return {"message": "Password changed successfully"}


@router.get("/sessions", response_model=List[schemas.UserSession])
async def get_user_sessions(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get user's active sessions"""
    sessions = db.query(models.UserSession).filter(
        models.UserSession.user_id == current_user.id,
        models.UserSession.is_active == True,
        models.UserSession.expires_at > datetime.utcnow()
    ).all()
    
    return sessions


@router.get("/security-info", response_model=schemas.UserSecurityInfo)
async def get_security_info(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get user's security information"""
    active_sessions = db.query(models.UserSession).filter(
        models.UserSession.user_id == current_user.id,
        models.UserSession.is_active == True,
        models.UserSession.expires_at > datetime.utcnow()
    ).count()
    
    return schemas.UserSecurityInfo(
        mfa_enabled=current_user.mfa_enabled,
        last_login=current_user.last_login,
        failed_login_attempts=current_user.failed_login_attempts,
        locked_until=current_user.locked_until,
        password_changed_at=current_user.password_changed_at,
        active_sessions_count=active_sessions
    ) 