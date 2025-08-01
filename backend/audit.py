import json
from datetime import datetime, date
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import Request
from . import models, database


class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle datetime and date objects."""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


class AuditLogger:
    """Audit logging system for tracking user actions."""
    
    @staticmethod
    def log_action(
        db: Session,
        user_id: int,
        action: str,
        table_name: str,
        record_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log an action to the audit trail."""
        
        # Get client information
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        # Convert values to JSON strings
        old_values_json = json.dumps(old_values, cls=DateTimeEncoder) if old_values else None
        new_values_json = json.dumps(new_values, cls=DateTimeEncoder) if new_values else None
        
        # Create audit log entry
        audit_log = models.AuditLog(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_values=old_values_json,
            new_values=new_values_json,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    
    @staticmethod
    def log_create(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        new_values: Dict[str, Any],
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log a record creation."""
        return AuditLogger.log_action(
            db=db,
            user_id=user_id,
            action="create",
            table_name=table_name,
            record_id=record_id,
            new_values=new_values,
            request=request
        )
    
    @staticmethod
    def log_update(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any],
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log a record update."""
        return AuditLogger.log_action(
            db=db,
            user_id=user_id,
            action="update",
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            new_values=new_values,
            request=request
        )
    
    @staticmethod
    def log_delete(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        old_values: Dict[str, Any],
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log a record deletion."""
        return AuditLogger.log_action(
            db=db,
            user_id=user_id,
            action="delete",
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            request=request
        )
    
    @staticmethod
    def log_login(
        db: Session,
        user_id: int,
        success: bool,
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log a login attempt."""
        action = "login_success" if success else "login_failed"
        return AuditLogger.log_action(
            db=db,
            user_id=user_id,
            action=action,
            table_name="users",
            record_id=user_id,
            request=request
        )
    
    @staticmethod
    def log_logout(
        db: Session,
        user_id: int,
        request: Optional[Request] = None
    ) -> models.AuditLog:
        """Log a logout."""
        return AuditLogger.log_action(
            db=db,
            user_id=user_id,
            action="logout",
            table_name="users",
            record_id=user_id,
            request=request
        )


def get_audit_logs(
    db: Session,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    table_name: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0
) -> list[models.AuditLog]:
    """Get audit logs with filtering options."""
    
    query = db.query(models.AuditLog)
    
    if user_id:
        query = query.filter(models.AuditLog.user_id == user_id)
    
    if action:
        query = query.filter(models.AuditLog.action == action)
    
    if table_name:
        query = query.filter(models.AuditLog.table_name == table_name)
    
    if start_date:
        query = query.filter(models.AuditLog.created_at >= start_date)
    
    if end_date:
        query = query.filter(models.AuditLog.created_at <= end_date)
    
    return query.order_by(models.AuditLog.created_at.desc()).offset(offset).limit(limit).all()


def get_user_activity_summary(db: Session, user_id: int, days: int = 30) -> Dict[str, Any]:
    """Get a summary of user activity for the specified number of days."""
    
    from datetime import timedelta
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Get all user actions
    actions = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == user_id,
        models.AuditLog.created_at >= start_date
    ).all()
    
    # Count actions by type
    action_counts = {}
    table_counts = {}
    
    for action in actions:
        # Count by action type
        action_counts[action.action] = action_counts.get(action.action, 0) + 1
        
        # Count by table
        table_counts[action.table_name] = table_counts.get(action.table_name, 0) + 1
    
    return {
        "user_id": user_id,
        "period_days": days,
        "total_actions": len(actions),
        "action_breakdown": action_counts,
        "table_breakdown": table_counts,
        "last_activity": actions[0].created_at if actions else None
    }


def export_audit_logs(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    format: str = "json"
) -> str:
    """Export audit logs in specified format."""
    
    logs = get_audit_logs(db, start_date=start_date, end_date=end_date, limit=10000)
    
    if format.lower() == "json":
        return json.dumps([
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "table_name": log.table_name,
                "record_id": log.record_id,
                "old_values": json.loads(log.old_values) if log.old_values else None,
                "new_values": json.loads(log.new_values) if log.new_values else None,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ], indent=2)
    
    elif format.lower() == "csv":
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "ID", "User ID", "Action", "Table", "Record ID",
            "Old Values", "New Values", "IP Address", "User Agent", "Created At"
        ])
        
        # Write data
        for log in logs:
            writer.writerow([
                log.id,
                log.user_id,
                log.action,
                log.table_name,
                log.record_id,
                log.old_values,
                log.new_values,
                log.ip_address,
                log.user_agent,
                log.created_at.isoformat()
            ])
        
        return output.getvalue()
    
    else:
        raise ValueError(f"Unsupported format: {format}") 