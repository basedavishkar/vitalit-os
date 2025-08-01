from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from backend import models, schemas, database, auth, audit
from backend.auth import generate_doctor_id

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=schemas.Doctor, status_code=201)
async def create_doctor(
    doctor_data: schemas.DoctorCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new doctor."""
    
    # Check if license number already exists
    existing_license = db.query(models.Doctor).filter(
        models.Doctor.license_number == doctor_data.license_number
    ).first()
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License number already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(models.Doctor).filter(
        models.Doctor.email == doctor_data.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate unique doctor ID
    doctor_id = generate_doctor_id()
    
    # Create doctor
    db_doctor = models.Doctor(
        doctor_id=doctor_id,
        **doctor_data.model_dump()
    )
    
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    
    # Log doctor creation
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_create(
        db, user_id, "doctors", db_doctor.id,
        {
            "doctor_id": doctor_id,
            "first_name": doctor_data.first_name,
            "last_name": doctor_data.last_name,
            "specialization": doctor_data.specialization,
            "license_number": doctor_data.license_number,
            "email": doctor_data.email
        },
        request
    )
    
    return db_doctor

@router.get("/", response_model=List[schemas.Doctor])
async def get_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or license number"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get doctors with optional filtering and search."""
    
    query = db.query(models.Doctor)
    
    # Apply filters
    if specialization:
        query = query.filter(models.Doctor.specialization.ilike(f"%{specialization}%"))
    
    if is_active is not None:
        query = query.filter(models.Doctor.is_active == is_active)
    
    # Apply search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Doctor.first_name.ilike(search_term),
                models.Doctor.last_name.ilike(search_term),
                models.Doctor.license_number.ilike(search_term)
            )
        )
    
    # Apply pagination
    doctors = query.order_by(models.Doctor.last_name, models.Doctor.first_name).offset(skip).limit(limit).all()
    
    return doctors

@router.get("/{doctor_id}", response_model=schemas.Doctor)
async def get_doctor(
    doctor_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a specific doctor by ID."""
    
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    return doctor

@router.get("/by-license/{license_number}", response_model=schemas.Doctor)
async def get_doctor_by_license(
    license_number: str,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a doctor by license number."""
    
    doctor = db.query(models.Doctor).filter(
        models.Doctor.license_number == license_number
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    return doctor

@router.put("/{doctor_id}", response_model=schemas.Doctor)
async def update_doctor(
    doctor_id: int,
    doctor_data: schemas.DoctorUpdate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update a doctor."""
    
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check for license number conflicts if being updated
    if doctor_data.license_number and doctor_data.license_number != doctor.license_number:
        existing_license = db.query(models.Doctor).filter(
            models.Doctor.license_number == doctor_data.license_number
        ).first()
        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number already registered"
            )
    
    # Check for email conflicts if being updated
    if doctor_data.email and doctor_data.email != doctor.email:
        existing_email = db.query(models.Doctor).filter(
            models.Doctor.email == doctor_data.email
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Store old values for audit
    old_values = {
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "specialization": doctor.specialization,
        "qualification": doctor.qualification,
        "license_number": doctor.license_number,
        "phone": doctor.phone,
        "email": doctor.email,
        "address": doctor.address,
        "consultation_fee": doctor.consultation_fee,
        "is_active": doctor.is_active
    }
    
    # Update doctor fields
    update_data = doctor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doctor, field, value)
    
    db.commit()
    db.refresh(doctor)
    
    # Log doctor update
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_update(
        db, user_id, "doctors", doctor.id,
        old_values, update_data, request
    )
    
    return doctor

@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete a doctor (admin only)."""
    
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check if doctor has related records
    has_appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id
    ).first() is not None
    
    has_medical_records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.doctor_id == doctor_id
    ).first() is not None
    
    has_prescriptions = db.query(models.Prescription).filter(
        models.Prescription.doctor_id == doctor_id
    ).first() is not None
    
    if has_appointments or has_medical_records or has_prescriptions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete doctor with existing appointments, medical records, or prescriptions"
        )
    
    # Store old values for audit
    old_values = {
        "doctor_id": doctor.doctor_id,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "specialization": doctor.specialization,
        "license_number": doctor.license_number,
        "email": doctor.email
    }
    
    # Delete doctor
    db.delete(doctor)
    db.commit()
    
    # Log doctor deletion
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_delete(
        db, user_id, "doctors", doctor_id,
        old_values, request
    )
    
    return {"message": "Doctor deleted successfully"}

@router.get("/{doctor_id}/appointments", response_model=List[schemas.Appointment])
async def get_doctor_appointments(
    doctor_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    status: Optional[str] = Query(None, description="Filter by appointment status"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get all appointments for a specific doctor."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    query = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id)
    
    # Apply filters
    if start_date:
        query = query.filter(models.Appointment.scheduled_datetime >= start_date)
    
    if end_date:
        query = query.filter(models.Appointment.scheduled_datetime <= end_date)
    
    if status:
        query = query.filter(models.Appointment.status == status)
    
    appointments = query.order_by(models.Appointment.scheduled_datetime).all()
    
    return appointments

@router.get("/{doctor_id}/medical-records", response_model=List[schemas.MedicalRecord])
async def get_doctor_medical_records(
    doctor_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get all medical records created by a specific doctor."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    query = db.query(models.MedicalRecord).filter(models.MedicalRecord.doctor_id == doctor_id)
    
    # Apply filters
    if start_date:
        query = query.filter(models.MedicalRecord.visit_date >= start_date)
    
    if end_date:
        query = query.filter(models.MedicalRecord.visit_date <= end_date)
    
    medical_records = query.order_by(models.MedicalRecord.visit_date.desc()).all()
    
    return medical_records

@router.get("/{doctor_id}/prescriptions", response_model=List[schemas.Prescription])
async def get_doctor_prescriptions(
    doctor_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get all prescriptions created by a specific doctor."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    query = db.query(models.Prescription).filter(models.Prescription.doctor_id == doctor_id)
    
    # Apply filters
    if start_date:
        query = query.filter(models.Prescription.prescribed_date >= start_date)
    
    if end_date:
        query = query.filter(models.Prescription.prescribed_date <= end_date)
    
    if is_active is not None:
        query = query.filter(models.Prescription.is_active == is_active)
    
    prescriptions = query.order_by(models.Prescription.prescribed_date.desc()).all()
    
    return prescriptions

@router.get("/{doctor_id}/schedule")
async def get_doctor_schedule(
    doctor_id: int,
    date: date = Query(..., description="Date to get schedule for"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get doctor's schedule for a specific date."""
    
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
    
    # Calculate schedule statistics
    total_appointments = len(appointments)
    completed_appointments = len([a for a in appointments if a.status == models.AppointmentStatusEnum.COMPLETED])
    cancelled_appointments = len([a for a in appointments if a.status == models.AppointmentStatusEnum.CANCELLED])
    no_shows = len([a for a in appointments if a.status == models.AppointmentStatusEnum.NO_SHOW])
    
    return {
        "doctor": doctor,
        "date": date.isoformat(),
        "appointments": appointments,
        "statistics": {
            "total_appointments": total_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
            "no_shows": no_shows,
            "completion_rate": (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        }
    }

@router.get("/{doctor_id}/performance")
async def get_doctor_performance(
    doctor_id: int,
    start_date: Optional[datetime] = Query(None, description="Start date for performance period"),
    end_date: Optional[datetime] = Query(None, description="End date for performance period"),
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get doctor's performance metrics."""
    
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Build base queries
    appointment_query = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id)
    medical_record_query = db.query(models.MedicalRecord).filter(models.MedicalRecord.doctor_id == doctor_id)
    prescription_query = db.query(models.Prescription).filter(models.Prescription.doctor_id == doctor_id)
    
    # Apply date filters if provided
    if start_date:
        appointment_query = appointment_query.filter(models.Appointment.scheduled_datetime >= start_date)
        medical_record_query = medical_record_query.filter(models.MedicalRecord.visit_date >= start_date)
        prescription_query = prescription_query.filter(models.Prescription.prescribed_date >= start_date)
    
    if end_date:
        appointment_query = appointment_query.filter(models.Appointment.scheduled_datetime <= end_date)
        medical_record_query = medical_record_query.filter(models.MedicalRecord.visit_date <= end_date)
        prescription_query = prescription_query.filter(models.Prescription.prescribed_date <= end_date)
    
    # Get appointment statistics
    total_appointments = appointment_query.count()
    completed_appointments = appointment_query.filter(
        models.Appointment.status == models.AppointmentStatusEnum.COMPLETED
    ).count()
    cancelled_appointments = appointment_query.filter(
        models.Appointment.status == models.AppointmentStatusEnum.CANCELLED
    ).count()
    no_shows = appointment_query.filter(
        models.Appointment.status == models.AppointmentStatusEnum.NO_SHOW
    ).count()
    
    # Get medical record statistics
    total_medical_records = medical_record_query.count()
    
    # Get prescription statistics
    total_prescriptions = prescription_query.count()
    active_prescriptions = prescription_query.filter(
        models.Prescription.is_active == True
    ).count()
    
    # Calculate metrics
    completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
    cancellation_rate = (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
    no_show_rate = (no_shows / total_appointments * 100) if total_appointments > 0 else 0
    
    return {
        "doctor": doctor,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "appointments": {
            "total": total_appointments,
            "completed": completed_appointments,
            "cancelled": cancelled_appointments,
            "no_shows": no_shows,
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
            "no_show_rate": no_show_rate
        },
        "medical_records": {
            "total": total_medical_records
        },
        "prescriptions": {
            "total": total_prescriptions,
            "active": active_prescriptions,
            "inactive": total_prescriptions - active_prescriptions
        }
    }

@router.get("/specializations")
async def get_doctor_specializations(
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get all available doctor specializations."""
    
    specializations = db.query(models.Doctor.specialization).filter(
        models.Doctor.is_active == True
    ).distinct().all()
    
    return {
        "specializations": [spec.specialization for spec in specializations]
    }

@router.get("/reports/specialization-summary")
async def get_specialization_summary(
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    """Get summary of doctors by specialization."""
    
    # Get doctor counts by specialization
    specialization_counts = db.query(
        models.Doctor.specialization,
        func.count(models.Doctor.id).label('count')
    ).filter(models.Doctor.is_active == True).group_by(
        models.Doctor.specialization
    ).all()
    
    # Get total doctors
    total_doctors = db.query(models.Doctor).filter(
        models.Doctor.is_active == True
    ).count()
    
    return {
        "total_doctors": total_doctors,
        "specialization_breakdown": [
            {"specialization": item.specialization, "count": item.count}
            for item in specialization_counts
        ]
    }

