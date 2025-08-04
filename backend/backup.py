import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from config import settings
from logger import logger


class BackupManager:
    def __init__(self):
        self.backup_dir = Path(settings.backup_dir) if hasattr(settings, 'backup_dir') else Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_backup(self) -> str:
        """Create a backup of the database."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{timestamp}.db"
        backup_path = self.backup_dir / backup_filename
        
        # Copy the database file
        if os.path.exists("hospital.db"):
            shutil.copy2("hospital.db", backup_path)
            logger.info(f"Database backup created: {backup_path}")
            return str(backup_path)
        else:
            raise FileNotFoundError("Database file not found")
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """List all available backups."""
        backups = []
        for backup_file in self.backup_dir.glob("backup_*.db"):
            stat = backup_file.stat()
            backups.append({
                "filename": backup_file.name,
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "path": str(backup_file)
            })
        return sorted(backups, key=lambda x: x["created_at"], reverse=True)
    
    def restore_backup(self, backup_path: str) -> bool:
        """Restore from a backup file."""
        try:
            if os.path.exists(backup_path):
                shutil.copy2(backup_path, "hospital.db")
                logger.info(f"Database restored from: {backup_path}")
                return True
            else:
                logger.error(f"Backup file not found: {backup_path}")
                return False
        except Exception as e:
            logger.error(f"Backup restore failed: {str(e)}")
            return False
    
    def delete_backup(self, backup_filename: str) -> bool:
        """Delete a backup file."""
        try:
            backup_path = self.backup_dir / backup_filename
            if backup_path.exists():
                backup_path.unlink()
                logger.info(f"Backup deleted: {backup_filename}")
                return True
            else:
                logger.error(f"Backup file not found: {backup_filename}")
                return False
        except Exception as e:
            logger.error(f"Backup deletion failed: {str(e)}")
            return False
    
    def cleanup_old_backups(self, keep_days: int = 30) -> int:
        """Clean up old backups, keeping only recent ones."""
        cutoff_time = datetime.now().timestamp() - (keep_days * 24 * 60 * 60)
        deleted_count = 0
        
        for backup_file in self.backup_dir.glob("backup_*.db"):
            if backup_file.stat().st_ctime < cutoff_time:
                try:
                    backup_file.unlink()
                    deleted_count += 1
                    logger.info(f"Old backup deleted: {backup_file.name}")
                except Exception as e:
                    logger.error(f"Failed to delete old backup {backup_file.name}: {str(e)}")
        
        return deleted_count


# Create a global backup manager instance
backup_manager = BackupManager() 