import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./hospital.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: list = [
        "http://localhost:3000",
        "https://vitalit.vercel.app",
        "https://vitalit-os-l6br-git-main-av1shkars-projects.vercel.app",
        "https://vitalit-os-l6br-m9d5wbdpt-av1shkars-projects.vercel.app",
    ]
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "vitalit.log"
    
    # API
    api_prefix: str = ""
    title: str = "Vitalit OS API"
    version: str = "1.0.0"
    description: str = "Enterprise Hospital Management System API"
    
    # File upload
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # Email (optional)
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # Backup
    backup_dir: str = "backups"
    backup_retention_days: int = 30
    
    # Test mode
    test_mode: bool = False
    
    class Config:
        env_file = ".env"


settings = Settings() 