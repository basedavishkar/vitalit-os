import smtplib
from datetime import datetime, timedelta, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import database, models, schemas, audit
from backend.auth_enhanced import get_current_active_user, require_staff
from backend.config import settings

router = APIRouter(prefix="/appointments", tags=["Enhanced Appointment Management"])


class AppointmentScheduler:
    """Smart appointment scheduling with conflict detection"""
    
    @staticmethod
    def check_doctor_availability(
        db: Session,
        doctor_id: int,
        start_time: datetime,
        duration_minutes: int,
        exclude_appointment_id: Optional[int] = None
    ) -> bool:
        """Check if doctor is available for the given time slot"""
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Check for overlapping appointments
        query = db.query(models.Appointment).filter(
            and_(
                models.Appointment.doctor_id == doctor_id,
                models.Appointment.status.in_([
                    models.AppointmentStatusEnum.SCHEDULED,
                    models.AppointmentStatusEnum.CONFIRMED,
                    models.AppointmentStatusEnum.IN_PROGRESS
                ]),
                or_(
                    and_(
                        models.Appointment.scheduled_datetime < end_time,
                        models.Appointment.scheduled_datetime + 
                        func.cast(models.Appointment.duration_minutes, func.Integer) > start_time
                    )
                )
            )
        )
        
        if exclude_appointment_id:
            query = query.filter(models.Appointment.id != exclude_appointment_id)
        
        conflicting_appointments = query.count()
        return conflicting_appointments == 0
    
    @staticmethod
    def find_available_slots(
        db: Session,
        doctor_id: int,
        date: datetime.date,
        duration_minutes: int = 30
    ) -> List[datetime]:
        """Find available time slots for a doctor on a specific date"""
        # Doctor working hours (9 AM to 5 PM)
        start_hour = 9
        end_hour = 17
        
        available_slots = []
        current_time = datetime.combine(date, time(start_hour))
        end_time = datetime.combine(date, time(end_hour))
        
        while current_time + timedelta(minutes=duration_minutes) <= end_time:
            if AppointmentScheduler.check_doctor_availability(
                db, doctor_id, current_time, duration_minutes
            ):
                available_slots.append(current_time)
            current_time += timedelta(minutes=30)  # 30-minute intervals
        
        return available_slots


class NotificationService:
    """Email and SMS notification service"""
    
    @staticmethod
    def send_appointment_reminder(
        patient_email: str,
        patient_name: str,
        doctor_name: str,
        appointment_time: datetime,
        appointment_id: str
    ) -> bool:
        """Send appointment reminder email"""
        if not settings.smtp_server:
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.smtp_username
            msg['To'] = patient_email
            msg['Subject'] = f"Appointment Reminder - {appointment_id}"
            
            body = f"""
            Dear {patient_name},
            
            This is a reminder for your upcoming appointment:
            
            Doctor: Dr. {doctor_name}
            Date: {appointment_time.strftime('%B %d, %Y')}
            Time: {appointment_time.strftime('%I:%M %p')}
            Appointment ID: {appointment_id}
            
            Please arrive 15 minutes before your scheduled time.
            
            If you need to reschedule or cancel, please contact us immediately.
            
            Best regards,
            Vitalit OS Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False


@router.post("/smart-schedule", response_model=schemas.Appointment)
async def smart_schedule_appointment(
    appointment_data: schemas.SmartAppointmentRequest,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Smart appointment scheduling with automatic slot finding"""
    # Validate patient and doctor exist
    patient = db.query(models.Patient).filter(models.Patient.id == appointment_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment_data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Find available slots
    available_slots = AppointmentScheduler.find_available_slots(
        db, appointment_data.doctor_id, appointment_data.preferred_date, appointment_data.duration_minutes
    )
    
    if not available_slots:
        raise HTTPException(
            status_code=400,
            detail="No available slots for the specified date and doctor"
        )
    
    # Use the first available slot or preferred time if available
    scheduled_time = available_slots[0]
    if appointment_data.preferred_time:
        preferred_datetime = datetime.combine(appointment_data.preferred_date, appointment_data.preferred_time)
        for slot in available_slots:
            if abs((slot - preferred_datetime).total_seconds()) < 1800:  # Within 30 minutes
                scheduled_time = slot
                break
    
    # Create appointment
    appointment = models.Appointment(
        appointment_id=appointment_data.appointment_id or f"APT{datetime.now().strftime('%Y%m%d%H%M%S')}",
        patient_id=appointment_data.patient_id,
        doctor_id=appointment_data.doctor_id,
        scheduled_datetime=scheduled_time,
        duration_minutes=appointment_data.duration_minutes,
        reason=appointment_data.reason,
        notes=appointment_data.notes,
        status=models.AppointmentStatusEnum.SCHEDULED,
        created_by=current_user.id
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Send confirmation notification
    if patient.email:
        NotificationService.send_appointment_reminder(
            patient.email,
            f"{patient.first_name} {patient.last_name}",
            f"{doctor.first_name} {doctor.last_name}",
            scheduled_time,
            appointment.appointment_id
        )
    
    # Log appointment creation
    audit.AuditLogger.log_action(
        db, current_user.id, "APPOINTMENT_SMART_SCHEDULED", "appointments",
        record_id=appointment.id,
        new_values={
            "patient_id": appointment_data.patient_id,
            "doctor_id": appointment_data.doctor_id,
            "scheduled_datetime": scheduled_time.isoformat(),
            "appointment_id": appointment.appointment_id
        },
        request=request
    )
    
    return appointment


@router.get("/available-slots/{doctor_id}")
async def get_available_slots(
    doctor_id: int,
    date: datetime.date = Query(),
    duration_minutes: int = Query(30, ge=15, le=480),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get available appointment slots for a doctor on a specific date"""
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    available_slots = AppointmentScheduler.find_available_slots(
        db, doctor_id, date, duration_minutes
    )
    
    return {
        "doctor_id": doctor_id,
        "date": date,
        "duration_minutes": duration_minutes,
        "available_slots": [slot.strftime("%H:%M") for slot in available_slots],
        "total_slots": len(available_slots)
    }


@router.get("/conflicts/{doctor_id}")
async def check_scheduling_conflicts(
    doctor_id: int,
    start_time: datetime = Query(),
    duration_minutes: int = Query(30, ge=15, le=480),
    exclude_appointment_id: Optional[int] = Query(None),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Check for scheduling conflicts"""
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    is_available = AppointmentScheduler.check_doctor_availability(
        db, doctor_id, start_time, duration_minutes, exclude_appointment_id
    )
    
    if not is_available:
        # Get conflicting appointments
        end_time = start_time + timedelta(minutes=duration_minutes)
        conflicts = db.query(models.Appointment).filter(
            and_(
                models.Appointment.doctor_id == doctor_id,
                models.Appointment.status.in_([
                    models.AppointmentStatusEnum.SCHEDULED,
                    models.AppointmentStatusEnum.CONFIRMED,
                    models.AppointmentStatusEnum.IN_PROGRESS
                ]),
                or_(
                    and_(
                        models.Appointment.scheduled_datetime < end_time,
                        models.Appointment.scheduled_datetime + 
                        func.cast(models.Appointment.duration_minutes, func.Integer) > start_time
                    )
                )
            )
        ).all()
        
        return {
            "available": False,
            "conflicts": [
                {
                    "appointment_id": conflict.appointment_id,
                    "patient_name": f"{conflict.patient.first_name} {conflict.patient.last_name}",
                    "start_time": conflict.scheduled_datetime,
                    "end_time": conflict.scheduled_datetime + timedelta(minutes=conflict.duration_minutes),
                    "status": conflict.status.value
                }
                for conflict in conflicts
            ]
        }
    
    return {"available": True, "conflicts": []}


@router.get("/calendar/{doctor_id}")
async def get_doctor_calendar(
    doctor_id: int,
    start_date: datetime.date = Query(),
    end_date: datetime.date = Query(),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get doctor's calendar for a date range"""
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.scheduled_datetime >= datetime.combine(start_date, time.min),
            models.Appointment.scheduled_datetime <= datetime.combine(end_date, time.max)
        )
    ).order_by(models.Appointment.scheduled_datetime).all()
    
    calendar_events = []
    for appointment in appointments:
        calendar_events.append({
            "id": appointment.id,
            "title": f"{appointment.patient.first_name} {appointment.patient.last_name}",
            "start": appointment.scheduled_datetime.isoformat(),
            "end": (appointment.scheduled_datetime + timedelta(minutes=appointment.duration_minutes)).isoformat(),
            "status": appointment.status.value,
            "reason": appointment.reason,
            "patient_id": appointment.patient_id,
            "appointment_id": appointment.appointment_id
        })
    
    return {
        "doctor_id": doctor_id,
        "doctor_name": f"Dr. {doctor.first_name} {doctor.last_name}",
        "start_date": start_date,
        "end_date": end_date,
        "events": calendar_events
    }


@router.post("/{appointment_id}/remind")
async def send_appointment_reminder(
    appointment_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Send appointment reminder manually"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.patient.email:
        success = NotificationService.send_appointment_reminder(
            appointment.patient.email,
            f"{appointment.patient.first_name} {appointment.patient.last_name}",
            f"{appointment.doctor.first_name} {appointment.doctor.last_name}",
            appointment.scheduled_datetime,
            appointment.appointment_id
        )
        
        if success:
            # Log reminder sent
            audit.AuditLogger.log_action(
                db, current_user.id, "APPOINTMENT_REMINDER_SENT", "appointments",
                record_id=appointment_id
            )
            return {"message": "Reminder sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send reminder")
    else:
        raise HTTPException(status_code=400, detail="Patient has no email address")


@router.get("/waitlist")
async def get_waitlist(
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get waitlist for appointments"""
    waitlist_appointments = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatusEnum.SCHEDULED
    ).order_by(models.Appointment.scheduled_datetime).all()
    
    return waitlist_appointments 