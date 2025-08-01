from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend import models, schemas, database, auth, audit
from backend.auth import generate_patient_id

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/", response_model=schemas.Patient, status_code=201)
async def create_patient(
    patient_data: schemas.PatientCreate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new patient."""
    
    # Generate unique patient ID
    patient_id = generate_patient_id()
    
    # Create patient
    patient_dict = patient_data.model_dump()
    # Convert enum values to enum instances for SQLAlchemy
    if 'gender' in patient_dict:
        patient_dict['gender'] = models.GenderEnum(patient_dict['gender'])
    
    db_patient = models.Patient(
        patient_id=patient_id,
        **patient_dict
    )
    
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Log patient creation
    if current_user:
        audit.AuditLogger.log_create(
            db, current_user.id, "patients", db_patient.id,
            patient_data.model_dump(), request
        )
    
    return db_patient

@router.get("/", response_model=List[schemas.Patient])
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by name, phone, or patient ID"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    min_age: Optional[int] = Query(None, description="Minimum age"),
    max_age: Optional[int] = Query(None, description="Maximum age"),
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patients with optional filtering and search."""
    
    query = db.query(models.Patient)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Patient.first_name.ilike(search_term),
                models.Patient.last_name.ilike(search_term),
                models.Patient.patient_id.ilike(search_term),
                models.Patient.phone.ilike(search_term)
            )
        )
    
    # Apply gender filter
    if gender:
        query = query.filter(models.Patient.gender == gender)
    
    # Apply age filters
    if min_age or max_age:
        today = date.today()
        if min_age:
            max_birth_date = today.replace(year=today.year - min_age)
            query = query.filter(models.Patient.date_of_birth <= max_birth_date)
        if max_age:
            min_birth_date = today.replace(year=today.year - max_age - 1)
            query = query.filter(models.Patient.date_of_birth > min_birth_date)
    
    # Apply pagination
    patients = query.offset(skip).limit(limit).all()
    
    return patients

@router.get("/{patient_id}", response_model=schemas.Patient)
async def get_patient(
    patient_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a specific patient by ID."""
    
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.get("/by-patient-id/{patient_id_str}", response_model=schemas.Patient)
async def get_patient_by_patient_id(
    patient_id_str: str,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a patient by their patient ID string."""
    
    patient = db.query(models.Patient).filter(
        models.Patient.patient_id == patient_id_str
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.put("/{patient_id}", response_model=schemas.Patient)
async def update_patient(
    patient_id: int,
    patient_data: schemas.PatientUpdate,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update a patient."""
    
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Store old values for audit
    old_values = {
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender.value,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "phone": patient.phone,
        "email": patient.email,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "emergency_contact_relationship": patient.emergency_contact_relationship,
        "insurance_provider": patient.insurance_provider,
        "insurance_number": patient.insurance_number,
        "allergies": patient.allergies,
        "medical_history": patient.medical_history
    }
    
    # Update patient fields
    update_data = patient_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    db.commit()
    db.refresh(patient)
    
    # Log patient update
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_update(
        db, user_id, "patients", patient.id,
        old_values, update_data, request
    )
    
    return patient

@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete a patient (admin only)."""
    
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check if patient has related records
    has_appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).first() is not None
    
    has_medical_records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).first() is not None
    
    has_bills = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).first() is not None
    
    if has_appointments or has_medical_records or has_bills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete patient with existing appointments, medical records, or bills"
        )
    
    # Store old values for audit
    old_values = {
        "patient_id": patient.patient_id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender.value,
        "phone": patient.phone,
        "email": patient.email
    }
    
    # Delete patient
    db.delete(patient)
    db.commit()
    
    # Log patient deletion
    user_id = current_user.id if current_user else None
    audit.AuditLogger.log_delete(
        db, user_id, "patients", patient_id,
        old_values, request
    )
    
    return {"message": "Patient deleted successfully"}

@router.get("/{patient_id}/appointments", response_model=List[schemas.Appointment])
async def get_patient_appointments(
    patient_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get all appointments for a specific patient."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).order_by(models.Appointment.scheduled_datetime.desc()).all()
    
    return appointments

@router.get("/{patient_id}/medical-records", response_model=List[schemas.MedicalRecord])
async def get_patient_medical_records(
    patient_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get all medical records for a specific patient (doctors only)."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    medical_records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.visit_date.desc()).all()
    
    return medical_records

@router.get("/{patient_id}/bills", response_model=List[schemas.Bill])
async def get_patient_bills(
    patient_id: int,
    current_user: models.User = Depends(auth.require_receptionist),
    db: Session = Depends(database.get_db)
):
    """Get all bills for a specific patient (receptionists only)."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    bills = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).order_by(models.Bill.bill_date.desc()).all()
    
    return bills

@router.get("/{patient_id}/prescriptions", response_model=List[schemas.Prescription])
async def get_patient_prescriptions(
    patient_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get all prescriptions for a specific patient (doctors only)."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(models.Prescription.prescribed_date.desc()).all()
    
    return prescriptions

@router.get("/{patient_id}/summary")
async def get_patient_summary(
    patient_id: int,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Get a comprehensive summary of a patient."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get counts
    appointment_count = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).count()
    
    medical_record_count = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).count()
    
    bill_count = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).count()
    
    prescription_count = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).count()
    
    # Get latest records
    latest_appointment = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).order_by(models.Appointment.scheduled_datetime.desc()).first()
    
    latest_medical_record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.visit_date.desc()).first()
    
    latest_bill = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).order_by(models.Bill.bill_date.desc()).first()
    
    return {
        "patient": patient,
        "summary": {
            "total_appointments": appointment_count,
            "total_medical_records": medical_record_count,
            "total_bills": bill_count,
            "total_prescriptions": prescription_count,
            "latest_appointment": latest_appointment,
            "latest_medical_record": latest_medical_record,
            "latest_bill": latest_bill
        }
    }

@router.get("/search/advanced")
async def advanced_patient_search(
    name: Optional[str] = Query(None, description="Search by name"),
    phone: Optional[str] = Query(None, description="Search by phone"),
    email: Optional[str] = Query(None, description="Search by email"),
    blood_group: Optional[str] = Query(None, description="Filter by blood group"),
    insurance_provider: Optional[str] = Query(None, description="Filter by insurance provider"),
    has_allergies: Optional[bool] = Query(None, description="Filter by allergies"),
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.require_staff),
    db: Session = Depends(database.get_db)
):
    """Advanced patient search with multiple filters."""
    
    query = db.query(models.Patient)
    
    # Apply filters
    if name:
        name_term = f"%{name}%"
        query = query.filter(
            or_(
                models.Patient.first_name.ilike(name_term),
                models.Patient.last_name.ilike(name_term)
            )
        )
    
    if phone:
        query = query.filter(models.Patient.phone.ilike(f"%{phone}%"))
    
    if email:
        query = query.filter(models.Patient.email.ilike(f"%{email}%"))
    
    if blood_group:
        query = query.filter(models.Patient.blood_group == blood_group)
    
    if insurance_provider:
        query = query.filter(
            models.Patient.insurance_provider.ilike(f"%{insurance_provider}%")
        )
    
    if has_allergies is not None:
        if has_allergies:
            query = query.filter(models.Patient.allergies.isnot(None))
        else:
            query = query.filter(models.Patient.allergies.is_(None))
    
    # Apply pagination
    patients = query.offset(skip).limit(limit).all()
    
    return patients
