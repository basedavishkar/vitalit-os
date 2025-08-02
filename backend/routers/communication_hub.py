import smtplib
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import database, models, schemas, audit
from backend.auth_enhanced import require_staff, get_current_active_user
from backend.config import settings

router = APIRouter(prefix="/communication", tags=["Communication Hub"])


class InternalMessaging:
    """Internal messaging system for staff"""
    
    @staticmethod
    def send_message(
        db: Session,
        sender_id: int,
        recipient_id: int,
        subject: str,
        message: str,
        priority: str = "normal"
    ) -> models.InternalMessage:
        """Send internal message"""
        internal_message = models.InternalMessage(
            sender_id=sender_id,
            recipient_id=recipient_id,
            subject=subject,
            message=message,
            priority=priority,
            is_read=False
        )
        
        db.add(internal_message)
        db.commit()
        db.refresh(internal_message)
        
        return internal_message
    
    @staticmethod
    def get_user_messages(
        db: Session,
        user_id: int,
        unread_only: bool = False
    ) -> List[models.InternalMessage]:
        """Get messages for a user"""
        query = db.query(models.InternalMessage).filter(
            models.InternalMessage.recipient_id == user_id
        )
        
        if unread_only:
            query = query.filter(models.InternalMessage.is_read == False)
        
        return query.order_by(models.InternalMessage.created_at.desc()).all()


class NotificationService:
    """Notification service for patients and staff"""
    
    @staticmethod
    def send_email_notification(
        to_email: str,
        subject: str,
        message: str
    ) -> bool:
        """Send email notification"""
        if not settings.smtp_server:
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.smtp_username
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(message, 'plain'))
            
            server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    @staticmethod
    def send_sms_notification(
        phone_number: str,
        message: str
    ) -> bool:
        """Send SMS notification (simulated)"""
        # In production, integrate with SMS service like Twilio
        print(f"SMS to {phone_number}: {message}")
        return True


class PatientPortal:
    """Patient portal features"""
    
    @staticmethod
    def get_patient_appointments(
        db: Session,
        patient_id: int
    ) -> List[models.Appointment]:
        """Get patient's appointments"""
        return db.query(models.Appointment).filter(
            models.Appointment.patient_id == patient_id
        ).order_by(models.Appointment.scheduled_datetime.desc()).all()
    
    @staticmethod
    def get_patient_bills(
        db: Session,
        patient_id: int
    ) -> List[models.Bill]:
        """Get patient's bills"""
        return db.query(models.Bill).filter(
            models.Bill.patient_id == patient_id
        ).order_by(models.Bill.bill_date.desc()).all()
    
    @staticmethod
    def get_patient_medical_records(
        db: Session,
        patient_id: int
    ) -> List[models.MedicalRecord]:
        """Get patient's medical records"""
        return db.query(models.MedicalRecord).filter(
            models.MedicalRecord.patient_id == patient_id
        ).order_by(models.MedicalRecord.visit_date.desc()).all()


# Internal Messaging Endpoints
@router.post("/messages/send")
async def send_internal_message(
    message_data: schemas.InternalMessageCreate,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Send internal message"""
    # Validate recipient exists
    recipient = db.query(models.User).filter(models.User.id == message_data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    message = InternalMessaging.send_message(
        db, current_user.id, message_data.recipient_id,
        message_data.subject, message_data.message, message_data.priority
    )
    
    # Log message sent
    audit.AuditLogger.log_action(
        db, current_user.id, "INTERNAL_MESSAGE_SENT", "internal_messages",
        record_id=message.id,
        new_values={
            "recipient_id": message_data.recipient_id,
            "subject": message_data.subject
        },
        request=request
    )
    
    return message


@router.get("/messages/inbox")
async def get_inbox_messages(
    unread_only: bool = Query(False),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get user's inbox messages"""
    messages = InternalMessaging.get_user_messages(db, current_user.id, unread_only)
    return messages


@router.put("/messages/{message_id}/read")
async def mark_message_read(
    message_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Mark message as read"""
    message = db.query(models.InternalMessage).filter(
        and_(
            models.InternalMessage.id == message_id,
            models.InternalMessage.recipient_id == current_user.id
        )
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    message.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Message marked as read"}


# Notification Endpoints
@router.post("/notifications/send")
async def send_notification(
    notification_data: schemas.NotificationRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Send notification to patients or staff"""
    success_count = 0
    failed_count = 0
    
    for recipient_id in notification_data.recipient_ids:
        # Get recipient
        recipient = db.query(models.User).filter(models.User.id == recipient_id).first()
        if not recipient:
            failed_count += 1
            continue
        
        # Send email notification
        if recipient.email and notification_data.send_email:
            success = NotificationService.send_email_notification(
                recipient.email,
                notification_data.subject,
                notification_data.message
            )
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        # Send SMS notification
        if notification_data.send_sms:
            # Get patient phone if recipient is a patient
            patient = db.query(models.Patient).filter(models.Patient.user_id == recipient_id).first()
            if patient and patient.phone:
                success = NotificationService.send_sms_notification(
                    patient.phone,
                    notification_data.message
                )
                if success:
                    success_count += 1
                else:
                    failed_count += 1
        
        # Create notification record
        notification = models.Notification(
            recipient_id=recipient_id,
            sender_id=current_user.id,
            subject=notification_data.subject,
            message=notification_data.message,
            notification_type=notification_data.notification_type,
            is_read=False
        )
        db.add(notification)
    
    db.commit()
    
    return {
        "message": "Notifications sent",
        "success_count": success_count,
        "failed_count": failed_count
    }


@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get user's notifications"""
    query = db.query(models.Notification).filter(
        models.Notification.recipient_id == current_user.id
    )
    
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    
    notifications = query.order_by(models.Notification.created_at.desc()).all()
    return notifications


# Patient Portal Endpoints
@router.get("/portal/appointments/{patient_id}")
async def get_patient_portal_appointments(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient's appointments for portal"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    appointments = PatientPortal.get_patient_appointments(db, patient_id)
    return appointments


@router.get("/portal/bills/{patient_id}")
async def get_patient_portal_bills(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient's bills for portal"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    bills = PatientPortal.get_patient_bills(db, patient_id)
    return bills


@router.get("/portal/medical-records/{patient_id}")
async def get_patient_portal_records(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient's medical records for portal"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    records = PatientPortal.get_patient_medical_records(db, patient_id)
    return records


# Broadcast Messages
@router.post("/broadcast")
async def send_broadcast_message(
    broadcast_data: schemas.BroadcastMessageRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Send broadcast message to all staff or patients"""
    success_count = 0
    failed_count = 0
    
    if broadcast_data.target == "staff":
        recipients = db.query(models.User).filter(models.User.is_active == True).all()
    elif broadcast_data.target == "patients":
        recipients = db.query(models.Patient).all()
    else:
        raise HTTPException(status_code=400, detail="Invalid target")
    
    for recipient in recipients:
        if broadcast_data.target == "staff":
            if recipient.email:
                success = NotificationService.send_email_notification(
                    recipient.email,
                    broadcast_data.subject,
                    broadcast_data.message
                )
                if success:
                    success_count += 1
                else:
                    failed_count += 1
        else:  # patients
            if recipient.email:
                success = NotificationService.send_email_notification(
                    recipient.email,
                    broadcast_data.subject,
                    broadcast_data.message
                )
                if success:
                    success_count += 1
                else:
                    failed_count += 1
    
    return {
        "message": "Broadcast message sent",
        "target": broadcast_data.target,
        "success_count": success_count,
        "failed_count": failed_count,
        "total_recipients": len(recipients)
    } 