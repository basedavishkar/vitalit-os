import os
import shutil
import sqlite3
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from typing import List
from .config import settings
from .logger import logger


class BackupManager:
    """Manages database and file backups."""
    
    def __init__(self):
        self.backup_dir = Path(settings.backup_dir)
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_backup(self, include_files: bool = True) -> str:
        """Create a complete backup of the system."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"vitalit_backup_{timestamp}"
        backup_path = self.backup_dir / backup_name
        backup_path.mkdir(exist_ok=True)
        
        try:
            # Backup database
            self._backup_database(backup_path)
            
            # Backup files if requested
            if include_files:
                self._backup_files(backup_path)
            
            # Create metadata
            self._create_backup_metadata(backup_path, timestamp)
            
            # Create zip archive
            zip_path = self._create_zip_archive(backup_path, backup_name)
            
            # Clean up temporary directory
            shutil.rmtree(backup_path)
            
            logger.info(f"Backup created successfully: {zip_path}")
            return str(zip_path)
            
        except Exception as e:
            logger.error(f"Backup failed: {str(e)}")
            if backup_path.exists():
                shutil.rmtree(backup_path)
            raise
    
    def _backup_database(self, backup_path: Path):
        """Backup the SQLite database."""
        db_path = Path("hospital.db")
        if db_path.exists():
            backup_db_path = backup_path / "hospital.db"
            shutil.copy2(db_path, backup_db_path)
            
            # Create SQL dump
            self._create_sql_dump(backup_path)
    
    def _create_sql_dump(self, backup_path: Path):
        """Create SQL dump of the database."""
        dump_path = backup_path / "database_dump.sql"
        
        try:
            conn = sqlite3.connect("hospital.db")
            with open(dump_path, 'w') as f:
                for line in conn.iterdump():
                    f.write(f'{line}\n')
            conn.close()
        except Exception as e:
            logger.error(f"SQL dump creation failed: {str(e)}")
    
    def _backup_files(self, backup_path: Path):
        """Backup important files."""
        files_to_backup = [
            "logs/",
            "uploads/",
            ".env",
            "requirements.txt",
            "alembic.ini"
        ]
        
        for file_path in files_to_backup:
            if os.path.exists(file_path):
                dest_path = backup_path / Path(file_path).name
                if os.path.isdir(file_path):
                    shutil.copytree(file_path, dest_path)
                else:
                    shutil.copy2(file_path, dest_path)
    
    def _create_backup_metadata(self, backup_path: Path, timestamp: str):
        """Create metadata file for the backup."""
        metadata = {
            "backup_timestamp": timestamp,
            "created_at": datetime.now().isoformat(),
            "version": settings.version,
            "database_size": self._get_database_size(),
            "files_backed_up": self._list_backed_files(backup_path)
        }
        
        import json
        metadata_path = backup_path / "backup_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def _get_database_size(self) -> int:
        """Get database file size in bytes."""
        db_path = Path("hospital.db")
        return db_path.stat().st_size if db_path.exists() else 0
    
    def _list_backed_files(self, backup_path: Path) -> List[str]:
        """List all files in the backup."""
        files = []
        for root, dirs, filenames in os.walk(backup_path):
            for filename in filenames:
                rel_path = os.path.relpath(
                    os.path.join(root, filename), backup_path
                )
                files.append(rel_path)
        return files
    
    def _create_zip_archive(self, backup_path: Path, backup_name: str) -> Path:
        """Create a zip archive of the backup."""
        zip_path = self.backup_dir / f"{backup_name}.zip"
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(backup_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, backup_path)
                    zipf.write(file_path, arcname)
        
        return zip_path
    
    def restore_backup(self, backup_path: str) -> bool:
        """Restore from a backup file."""
        try:
            backup_file = Path(backup_path)
            if not backup_file.exists():
                raise FileNotFoundError(f"Backup file not found: {backup_path}")
            
            # Extract backup
            extract_path = self.backup_dir / "temp_restore"
            extract_path.mkdir(exist_ok=True)
            
            with zipfile.ZipFile(backup_file, 'r') as zipf:
                zipf.extractall(extract_path)
            
            # Restore database
            self._restore_database(extract_path)
            
            # Restore files
            self._restore_files(extract_path)
            
            # Clean up
            shutil.rmtree(extract_path)
            
            logger.info(f"Backup restored successfully from: {backup_path}")
            return True
            
        except Exception as e:
            logger.error(f"Backup restore failed: {str(e)}")
            return False
    
    def _restore_database(self, extract_path: Path):
        """Restore the database from backup."""
        backup_db = extract_path / "hospital.db"
        if backup_db.exists():
            # Stop any running database connections
            # This is a simplified version - in production, you'd need to
            # properly handle active connections
            
            # Backup current database
            current_db = Path("hospital.db")
            if current_db.exists():
                current_backup = Path("hospital.db.pre_restore")
                shutil.copy2(current_db, current_backup)
            
            # Restore from backup
            shutil.copy2(backup_db, current_db)
    
    def _restore_files(self, extract_path: Path):
        """Restore files from backup."""
        # Restore logs
        backup_logs = extract_path / "logs"
        if backup_logs.exists():
            shutil.rmtree("logs", ignore_errors=True)
            shutil.copytree(backup_logs, "logs")
        
        # Restore uploads
        backup_uploads = extract_path / "uploads"
        if backup_uploads.exists():
            shutil.rmtree("uploads", ignore_errors=True)
            shutil.copytree(backup_uploads, "uploads")
    
    def cleanup_old_backups(self):
        """Remove backups older than retention period."""
        cutoff_date = datetime.now() - timedelta(
            days=settings.backup_retention_days
        )
        
        for backup_file in self.backup_dir.glob("*.zip"):
            file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
            if file_time < cutoff_date:
                backup_file.unlink()
                logger.info(f"Deleted old backup: {backup_file}")
    
    def list_backups(self) -> List[dict]:
        """List all available backups."""
        backups = []
        
        for backup_file in self.backup_dir.glob("*.zip"):
            file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
            file_size = backup_file.stat().st_size
            
            backups.append({
                "filename": backup_file.name,
                "created_at": file_time.isoformat(),
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2)
            })
        
        return sorted(backups, key=lambda x: x["created_at"], reverse=True)


# Global backup manager instance
backup_manager = BackupManager() 