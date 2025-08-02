from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import os
from pathlib import Path

from backup import backup_manager
from logger import logger
from config import settings
from auth import get_current_user
from models import User

router = APIRouter(prefix="/system", tags=["System Management"])


@router.post("/backup", response_model=Dict[str, str])
async def create_backup(current_user: User = Depends(get_current_user)):
    """Create a system backup."""
    if current_user is None or current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create backups"
        )
    
    try:
        backup_path = backup_manager.create_backup()
        logger.info(f"Backup created by user {current_user.id}: {backup_path}")
        return {"message": "Backup created successfully", "backup_path": backup_path}
    except Exception as e:
        logger.error(f"Backup creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Backup creation failed"
        )


@router.get("/backups", response_model=List[Dict[str, Any]])
async def list_backups(current_user: User = Depends(get_current_user)):
    """List all available backups."""
    if current_user is None or current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view backups"
        )
    
    try:
        backups = backup_manager.list_backups()
        return backups
    except Exception as e:
        logger.error(f"Failed to list backups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list backups"
        )


@router.post("/backup/{backup_filename}/restore")
async def restore_backup(
    backup_filename: str,
    current_user: User = Depends(get_current_user)
):
    """Restore from a backup file."""
    if current_user is None or current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can restore backups"
        )
    
    backup_path = Path(settings.backup_dir) / backup_filename
    if not backup_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file not found"
        )
    
    try:
        success = backup_manager.restore_backup(str(backup_path))
        if success:
            logger.info(f"Backup restored by user {current_user.id}: {backup_filename}")
            return {"message": "Backup restored successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Backup restore failed"
            )
    except Exception as e:
        logger.error(f"Backup restore failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Backup restore failed"
        )


@router.delete("/backup/{backup_filename}")
async def delete_backup(
    backup_filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a backup file."""
    if current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete backups"
        )
    
    backup_path = Path(settings.backup_dir) / backup_filename
    if not backup_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file not found"
        )
    
    try:
        backup_path.unlink()
        logger.info(f"Backup deleted by user {current_user.id}: {backup_filename}")
        return {"message": "Backup deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete backup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete backup"
        )


@router.post("/backup/cleanup")
async def cleanup_old_backups(current_user: User = Depends(get_current_user)):
    """Clean up old backups based on retention policy."""
    if current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can cleanup backups"
        )
    
    try:
        backup_manager.cleanup_old_backups()
        logger.info(f"Backup cleanup performed by user {current_user.id}")
        return {"message": "Old backups cleaned up successfully"}
    except Exception as e:
        logger.error(f"Backup cleanup failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Backup cleanup failed"
        )


@router.get("/logs")
async def get_logs(
    log_type: str = "main",
    lines: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get system logs."""
    if current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view logs"
        )
    
    log_files = {
        "main": "logs/vitalit.log",
        "error": "logs/error_vitalit.log"
    }
    
    if log_type not in log_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid log type"
        )
    
    log_path = Path(log_files[log_type])
    if not log_path.exists():
        return {"logs": [], "message": "Log file not found"}
    
    try:
        with open(log_path, 'r') as f:
            log_lines = f.readlines()
        
        # Get last N lines
        recent_logs = log_lines[-lines:] if len(log_lines) > lines else log_lines
        
        return {
            "logs": recent_logs,
            "total_lines": len(log_lines),
            "showing_last": len(recent_logs)
        }
    except Exception as e:
        logger.error(f"Failed to read logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read logs"
        )


@router.get("/status")
async def get_system_status(current_user: User = Depends(get_current_user)):
    """Get system status and health information."""
    if current_user is None or current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view system status"
        )
    
    try:
        # Database status
        db_path = Path("hospital.db")
        db_size = db_path.stat().st_size if db_path.exists() else 0
        
        # Disk usage
        total_space = os.statvfs('.').f_frsize * os.statvfs('.').f_blocks
        free_space = os.statvfs('.').f_frsize * os.statvfs('.').f_bavail
        
        # Backup status
        backups = backup_manager.list_backups()
        latest_backup = backups[0] if backups else None
        
        status_info = {
            "database": {
                "exists": db_path.exists(),
                "size_mb": round(db_size / (1024 * 1024), 2)
            },
            "disk": {
                "total_gb": round(total_space / (1024**3), 2),
                "free_gb": round(free_space / (1024**3), 2),
                "used_percent": round(
                    ((total_space - free_space) / total_space) * 100, 2
                )
            },
            "backups": {
                "total_count": len(backups),
                "latest_backup": latest_backup
            },
            "version": settings.version,
            "uptime": "System running"  # In production, track actual uptime
        }
        
        return status_info
    except Exception as e:
        logger.error(f"Failed to get system status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get system status"
        )


@router.get("/download/{backup_filename}")
async def download_backup(
    backup_filename: str,
    current_user: User = Depends(get_current_user)
):
    """Download a backup file."""
    if current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can download backups"
        )
    
    backup_path = Path(settings.backup_dir) / backup_filename
    if not backup_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file not found"
        )
    
    try:
        logger.info(f"Backup downloaded by user {current_user.id}: {backup_filename}")
        return FileResponse(
            path=backup_path,
            filename=backup_filename,
            media_type='application/zip'
        )
    except Exception as e:
        logger.error(f"Failed to download backup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download backup"
        ) 