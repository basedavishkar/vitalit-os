from datetime import datetime
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator, AnyHttpUrl
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "VITALIt Healthcare System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True  # Enable debug mode for development
    DEV_MODE: bool = True  # Enable development mode by default
    # Flag used in various places for bypass/relaxed behavior in development/tests
    test_mode: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./hospital.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    
    # Redis configuration
    REDIS_ENABLED: bool = False  # Disable Redis in development mode
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_SSL: bool = False
    REDIS_DB: int = 0
    
    # Security
    TOKEN_SECRET_KEY: str = secrets.token_urlsafe(32)
    REFRESH_TOKEN_SECRET_KEY: str = secrets.token_urlsafe(32)
    TOKEN_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Lowercase alias used by some parts of the codebase
    access_token_expire_minutes: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24
    MFA_ENABLED: bool = True
    SECURE_COOKIES: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".pdf"]
    
    # Email
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "logs/vitalit.log"
    LOG_ROTATION: str = "1 day"
    LOG_RETENTION: str = "30 days"
    
    # Backup
    BACKUP_DIR: str = "backups"
    BACKUP_RETENTION_DAYS: int = 30
    BACKUP_TIME: str = "00:00"  # Daily backup time (UTC)
    
    # Monitoring
    ENABLE_PROMETHEUS: bool = False
    PROMETHEUS_PORT: int = 9090
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Payment Processing
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_API_VERSION: str = "2024-01-01"
    
    # Feature Flags
    ENABLE_MFA: bool = True
    ENABLE_PASSWORD_RESET: bool = True
    ENABLE_EMAIL_VERIFICATION: bool = True
    ENABLE_AUDIT_LOGS: bool = True
    ENABLE_FILE_UPLOAD: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"
        
        @validator("DATABASE_URL")
        def validate_database_url(cls, v: str) -> str:
            # Relaxed validator for local development; allow sqlite file
            return v
        
        @validator("ALLOWED_ORIGINS")
        def validate_allowed_origins(cls, v: List[str]) -> List[str]:
            if not v:
                raise ValueError("At least one origin must be allowed")
            return v
        
        @validator("TOKEN_SECRET_KEY", "REFRESH_TOKEN_SECRET_KEY")
        def validate_secret_keys(cls, v: str) -> str:
            if len(v) < 32:
                raise ValueError("Secret keys must be at least 32 characters long")
            return v


# Create settings instance
settings = Settings(
    _env_file=".env",
    _env_file_encoding="utf-8"
)