import json
from datetime import datetime, date
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import Request
from .models import AuditLog


class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle datetime and date objects."""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


class AuditLogger:
    """Audit logging system for tracking user actions."""
    
    @staticmethod
    def log_create(db: Session, user_id: int, table_name: str, record_id: int, new_values: dict, request: Request = None):
        """Log a create operation."""
        audit_log = AuditLog(
            user_id=user_id,
            action="create",
            table_name=table_name,
            record_id=record_id,
            new_values=str(new_values),
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        db.add(audit_log)
        db.commit()
    
    @staticmethod
    def log_update(db: Session, user_id: int, table_name: str, record_id: int, old_values: dict, new_values: dict, request: Request = None):
        """Log an update operation."""
        audit_log = AuditLog(
            user_id=user_id,
            action="update",
            table_name=table_name,
            record_id=record_id,
            old_values=str(old_values),
            new_values=str(new_values),
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        db.add(audit_log)
        db.commit()
    
    @staticmethod
    def log_delete(db: Session, user_id: int, table_name: str, record_id: int, old_values: dict, request: Request = None):
        """Log a delete operation."""
        audit_log = AuditLog(
            user_id=user_id,
            action="delete",
            table_name=table_name,
            record_id=record_id,
            old_values=str(old_values),
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        db.add(audit_log)
        db.commit()
    
    @staticmethod
    def log_login(
        db: Session,
        user_id: int,
        success: bool,
        request: Optional[Request] = None
    ) -> AuditLog:
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
    ) -> AuditLog:
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
) -> list[AuditLog]:
    """Get audit logs with filtering options."""
    
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()


def get_user_activity_summary(db: Session, user_id: int, days: int = 30) -> Dict[str, Any]:
    """Get a summary of user activity for the specified number of days."""
    
    from datetime import timedelta
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Get all user actions
    actions = db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.created_at >= start_date
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