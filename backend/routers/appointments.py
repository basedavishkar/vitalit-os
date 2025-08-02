from typing import List, Optional
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import models, schemas, database, auth, audit
from auth import generate_appointment_id

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=schemas.Appointment, status_code=201)
async def create_appointment(
    appointment_data: schemas.AppointmentCreate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new appointment with conflict detection."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == appointment_data.patient_id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify doctor exists and is active
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == appointment_data.doctor_id,
        models.Doctor.is_active == True
    ).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or inactive"
        )
    
    # Check for scheduling conflicts
    appointment_start = appointment_data.scheduled_datetime
    appointment_end = appointment_start + timedelta(minutes=appointment_data.duration_minutes)
    
    # Check doctor availability (simplified)
    conflicting_appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.doctor_id == appointment_data.doctor_id,
            models.Appointment.status.in_([
                models.AppointmentStatusEnum.SCHEDULED,
                models.AppointmentStatusEnum.CONFIRMED
            ]),
            models.Appointment.scheduled_datetime < appointment_end
        )
    ).first()
    
    if conflicting_appointments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor has a conflicting appointment at this time"
        )
    
    # Check patient availability (simplified)
    patient_conflicts = db.query(models.Appointment).filter(
        and_(
            models.Appointment.patient_id == appointment_data.patient_id,
            models.Appointment.status.in_([
                models.AppointmentStatusEnum.SCHEDULED,
                models.AppointmentStatusEnum.CONFIRMED
            ]),
            models.Appointment.scheduled_datetime < appointment_end
        )
    ).first()
    
    if patient_conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient has a conflicting appointment at this time"
        )
    
    # Generate unique appointment ID
    appointment_id = generate_appointment_id()
    
    # Create appointment
    db_appointment = models.Appointment(
        appointment_id=appointment_id,
        patient_id=appointment_data.patient_id,
        doctor_id=appointment_data.doctor_id,
        scheduled_datetime=appointment_data.scheduled_datetime,
        duration_minutes=appointment_data.duration_minutes,
        reason=appointment_data.reason,
        status=models.AppointmentStatusEnum.SCHEDULED,
        notes=appointment_data.notes,
        created_by=current_user.id if current_user else None
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Log appointment creation
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_create(
        db, user_id, "appointments", db_appointment.id,
        {
            "appointment_id": appointment_id,
            "patient_id": appointment_data.patient_id,
            "doctor_id": appointment_data.doctor_id,
            "scheduled_datetime": appointment_data.scheduled_datetime.isoformat(),
            "duration_minutes": appointment_data.duration_minutes
        },
        request
    )
    
    return db_appointment

@router.get("/", response_model=List[schemas.Appointment])
async def get_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[int] = Query(None, description="Filter by doctor ID"),
    status: Optional[str] = Query(None, description="Filter by appointment status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get appointments with optional filtering."""
    
    query = db.query(models.Appointment)
    
    # Apply filters
    if patient_id:
        query = query.filter(models.Appointment.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(models.Appointment.doctor_id == doctor_id)
    
    if status:
        query = query.filter(models.Appointment.status == status)
    
    if start_date:
        query = query.filter(models.Appointment.scheduled_datetime >= start_date)
    
    if end_date:
        query = query.filter(models.Appointment.scheduled_datetime <= end_date)
    
    # Apply pagination
    appointments = query.order_by(models.Appointment.scheduled_datetime).offset(skip).limit(limit).all()
    
    return appointments

@router.get("/{appointment_id}", response_model=schemas.Appointment)
async def get_appointment(
    appointment_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a specific appointment by ID."""
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    return appointment

@router.put("/{appointment_id}", response_model=schemas.Appointment)
async def update_appointment(
    appointment_id: int,
    appointment_data: schemas.AppointmentUpdate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update an appointment."""
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Store old values for audit
    old_values = {
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "scheduled_datetime": appointment.scheduled_datetime,
        "duration_minutes": appointment.duration_minutes,
        "reason": appointment.reason,
        "status": appointment.status.value,
        "notes": appointment.notes
    }
    
    # Check for conflicts if datetime or doctor is being changed
    if (appointment_data.scheduled_datetime or appointment_data.doctor_id or 
        appointment_data.duration_minutes):
        
        new_datetime = appointment_data.scheduled_datetime or appointment.scheduled_datetime
        new_doctor_id = appointment_data.doctor_id or appointment.doctor_id
        new_duration = appointment_data.duration_minutes or appointment.duration_minutes
        
        appointment_start = new_datetime
        appointment_end = appointment_start + timedelta(minutes=new_duration)
        
        # Check for conflicts excluding current appointment
        conflicting_appointments = db.query(models.Appointment).filter(
            and_(
                models.Appointment.id != appointment_id,
                models.Appointment.doctor_id == new_doctor_id,
                models.Appointment.status.in_([
                    models.AppointmentStatusEnum.SCHEDULED,
                    models.AppointmentStatusEnum.CONFIRMED
                ]),
                or_(
                    and_(
                        models.Appointment.scheduled_datetime < appointment_end,
                        models.Appointment.scheduled_datetime + 
                        func.cast(models.Appointment.duration_minutes, func.Integer) * 
                        func.interval('1 minute') > appointment_start
                    )
                )
            )
        ).first()
        
        if conflicting_appointments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor has a conflicting appointment at this time"
            )
    
    # Update appointment fields
    update_data = appointment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    
    # Log appointment update
    audit.AuditLogger.log_update(
        db, current_user.id, "appointments", appointment.id,
        old_values, update_data, request
    )
    
    return appointment

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete an appointment."""
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check if appointment can be cancelled
    if appointment.status in [
        models.AppointmentStatusEnum.COMPLETED,
        models.AppointmentStatusEnum.IN_PROGRESS
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete completed or in-progress appointment"
        )
    
    # Store old values for audit
    old_values = {
        "appointment_id": appointment.appointment_id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "scheduled_datetime": appointment.scheduled_datetime,
        "status": appointment.status.value
    }
    
    # Delete appointment
    db.delete(appointment)
    db.commit()
    
    # Log appointment deletion
    audit.AuditLogger.log_delete(
        db, current_user.id, "appointments", appointment_id,
        old_values, request
    )
    
    return {"message": "Appointment deleted successfully"}

@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    status: models.AppointmentStatusEnum,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update appointment status."""
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    old_status = appointment.status
    appointment.status = status
    
    db.commit()
    db.refresh(appointment)
    
    # Log status change
    audit.AuditLogger.log_update(
        db, current_user.id, "appointments", appointment.id,
        {"status": old_status.value}, {"status": status.value}, request
    )
    
    return {"message": f"Appointment status updated to {status.value}"}

@router.get("/calendar/{doctor_id}")
async def get_doctor_calendar(
    doctor_id: int,
    date: date = Query(..., description="Date to get calendar for"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get doctor's calendar for a specific date."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id,
        models.Doctor.is_active == True
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or inactive"
        )
    
    # Get appointments for the date
    start_datetime = datetime.combine(date, datetime.min.time())
    end_datetime = datetime.combine(date, datetime.max.time())
    
    appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.scheduled_datetime >= start_datetime,
            models.Appointment.scheduled_datetime <= end_datetime
        )
    ).order_by(models.Appointment.scheduled_datetime).all()
    
    # Create time slots (assuming 30-minute slots from 8 AM to 6 PM)
    time_slots = []
    start_time = datetime.combine(date, datetime.min.time().replace(hour=8))
    end_time = datetime.combine(date, datetime.min.time().replace(hour=18))
    
    current_time = start_time
    while current_time < end_time:
        slot_end = current_time + timedelta(minutes=30)
        
        # Check if slot is occupied
        occupied_appointment = None
        for appointment in appointments:
            appointment_end = appointment.scheduled_datetime + timedelta(
                minutes=appointment.duration_minutes
            )
            if (appointment.scheduled_datetime < slot_end and 
                appointment_end > current_time):
                occupied_appointment = appointment
                break
        
        time_slots.append({
            "time": current_time.strftime("%H:%M"),
            "datetime": current_time.isoformat(),
            "available": occupied_appointment is None,
            "appointment": occupied_appointment
        })
        
        current_time = slot_end
    
    return {
        "doctor": doctor,
        "date": date.isoformat(),
        "time_slots": time_slots,
        "appointments": appointments
    }

@router.get("/conflicts/check")
async def check_scheduling_conflicts(
    doctor_id: int,
    start_datetime: datetime,
    duration_minutes: int = 30,
    exclude_appointment_id: Optional[int] = Query(None, description="Exclude this appointment ID"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Check for scheduling conflicts."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id,
        models.Doctor.is_active == True
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or inactive"
        )
    
    appointment_start = start_datetime
    appointment_end = appointment_start + timedelta(minutes=duration_minutes)
    
    # Build query
    query = db.query(models.Appointment).filter(
        and_(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.status.in_([
                models.AppointmentStatusEnum.SCHEDULED,
                models.AppointmentStatusEnum.CONFIRMED
            ]),
            or_(
                and_(
                    models.Appointment.scheduled_datetime < appointment_end,
                    models.Appointment.scheduled_datetime + 
                    func.cast(models.Appointment.duration_minutes, func.Integer) * 
                    func.interval('1 minute') > appointment_start
                )
            )
        )
    )
    
    # Exclude specific appointment if provided
    if exclude_appointment_id:
        query = query.filter(models.Appointment.id != exclude_appointment_id)
    
    conflicting_appointments = query.all()
    
    return {
        "has_conflicts": len(conflicting_appointments) > 0,
        "conflicting_appointments": conflicting_appointments,
        "requested_slot": {
            "start": appointment_start.isoformat(),
            "end": appointment_end.isoformat(),
            "duration_minutes": duration_minutes
        }
    }

@router.get("/reports/daily")
async def get_daily_appointments_report(
    date: date = Query(..., description="Date for report"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get daily appointments report."""
    
    start_datetime = datetime.combine(date, datetime.min.time())
    end_datetime = datetime.combine(date, datetime.max.time())
    
    # Get all appointments for the date
    appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.scheduled_datetime >= start_datetime,
            models.Appointment.scheduled_datetime <= end_datetime
        )
    ).order_by(models.Appointment.scheduled_datetime).all()
    
    # Group by status
    status_counts = {}
    doctor_counts = {}
    
    for appointment in appointments:
        # Count by status
        status = appointment.status.value
        status_counts[status] = status_counts.get(status, 0) + 1
        
        # Count by doctor
        doctor_counts[appointment.doctor_id] = doctor_counts.get(appointment.doctor_id, 0) + 1
    
    return {
        "date": date.isoformat(),
        "total_appointments": len(appointments),
        "status_breakdown": status_counts,
        "doctor_breakdown": doctor_counts,
        "appointments": appointments
    }
