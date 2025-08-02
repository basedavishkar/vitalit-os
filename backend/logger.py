import logging
import logging.handlers
import os
from typing import Optional
from config import settings


def setup_logger(name: str = "vitalit",
                log_file: Optional[str] = None) -> logging.Logger:
    """Setup a logger with file and console handlers."""
    
    if log_file is None:
        log_file = settings.log_file
    
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - '
        '%(funcName)s:%(lineno)d - %(message)s'
    )
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        f"logs/{log_file}",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.handlers.RotatingFileHandler(
        f"logs/error_{log_file}",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    return logger


def log_api_request(logger: logging.Logger, method: str, path: str, status_code: int, 
                   duration: float, user_id: Optional[int] = None):
    """Log API request details."""
    logger.info(
        f"API Request: {method} {path} - Status: {status_code} - "
        f"Duration: {duration:.3f}s - User: {user_id or 'anonymous'}"
    )


def log_security_event(logger: logging.Logger, event_type: str, user_id: Optional[int] = None, 
                      details: str = "", ip_address: str = ""):
    """Log security-related events."""
    logger.warning(
        f"Security Event: {event_type} - User: {user_id or 'anonymous'} - "
        f"IP: {ip_address} - Details: {details}"
    )


def log_database_operation(logger: logging.Logger, operation: str, table: str, 
                          record_id: Optional[int] = None, user_id: Optional[int] = None):
    """Log database operations."""
    logger.info(
        f"Database: {operation} on {table} - Record ID: {record_id} - User: {user_id or 'system'}"
    )


# Create main logger instance
logger = setup_logger() 