from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import models, schemas, database, auth, audit
from auth import generate_record_id, generate_prescription_id

router = APIRouter(prefix="/records", tags=["Medical Records"])

@router.post("/", response_model=schemas.MedicalRecord)
async def create_medical_record(
    record_data: schemas.MedicalRecordCreate,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new medical record with optional vitals."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == record_data.patient_id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify doctor exists and is active
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == record_data.doctor_id,
        models.Doctor.is_active == True
    ).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or inactive"
        )
    
    # Verify appointment exists if provided
    if record_data.appointment_id:
        appointment = db.query(models.Appointment).filter(
            models.Appointment.id == record_data.appointment_id
        ).first()
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
    
    # Generate unique record ID
    record_id = generate_record_id()
    
    # Create medical record
    db_record = models.MedicalRecord(
        record_id=record_id,
        patient_id=record_data.patient_id,
        doctor_id=record_data.doctor_id,
        appointment_id=record_data.appointment_id,
        visit_date=record_data.visit_date,
        chief_complaint=record_data.chief_complaint,
        diagnosis=record_data.diagnosis,
        treatment_plan=record_data.treatment_plan,
        prescription_notes=record_data.prescription_notes,
        follow_up_date=record_data.follow_up_date,
        created_by=current_user.id
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Create vitals if provided
    if record_data.vitals:
        db_vitals = models.PatientVitals(
            medical_record_id=db_record.id,
            **record_data.vitals.dict()
        )
        db.add(db_vitals)
        db.commit()
        db.refresh(db_vitals)
    
    # Log medical record creation
    audit.AuditLogger.log_create(
        db, current_user.id, "medical_records", db_record.id,
        {
            "record_id": record_id,
            "patient_id": record_data.patient_id,
            "doctor_id": record_data.doctor_id,
            "diagnosis": record_data.diagnosis,
            "has_vitals": record_data.vitals is not None
        },
        request
    )
    
    return db_record

@router.get("/", response_model=List[schemas.MedicalRecord])
async def get_medical_records(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[int] = Query(None, description="Filter by doctor ID"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get medical records with optional filtering."""
    
    query = db.query(models.MedicalRecord)
    
    # Apply filters
    if patient_id:
        query = query.filter(models.MedicalRecord.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(models.MedicalRecord.doctor_id == doctor_id)
    
    if start_date:
        query = query.filter(models.MedicalRecord.visit_date >= start_date)
    
    if end_date:
        query = query.filter(models.MedicalRecord.visit_date <= end_date)
    
    # Apply pagination
    records = query.order_by(models.MedicalRecord.visit_date.desc()).offset(skip).limit(limit).all()
    
    return records

@router.get("/{record_id}", response_model=schemas.MedicalRecord)
async def get_medical_record(
    record_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get a specific medical record by ID."""
    
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    return record

@router.put("/{record_id}", response_model=schemas.MedicalRecord)
async def update_medical_record(
    record_id: int,
    record_data: schemas.MedicalRecordUpdate,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update a medical record."""
    
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Store old values for audit
    old_values = {
        "patient_id": record.patient_id,
        "doctor_id": record.doctor_id,
        "appointment_id": record.appointment_id,
        "visit_date": record.visit_date,
        "chief_complaint": record.chief_complaint,
        "diagnosis": record.diagnosis,
        "treatment_plan": record.treatment_plan,
        "prescription_notes": record.prescription_notes,
        "follow_up_date": record.follow_up_date
    }
    
    # Update record fields
    update_data = record_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    
    db.commit()
    db.refresh(record)
    
    # Log medical record update
    audit.AuditLogger.log_update(
        db, current_user.id, "medical_records", record.id,
        old_values, update_data, request
    )
    
    return record

@router.delete("/{record_id}")
async def delete_medical_record(
    record_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Delete a medical record (admin only)."""
    
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Store old values for audit
    old_values = {
        "record_id": record.record_id,
        "patient_id": record.patient_id,
        "doctor_id": record.doctor_id,
        "diagnosis": record.diagnosis
    }
    
    # Delete associated vitals first
    db.query(models.PatientVitals).filter(
        models.PatientVitals.medical_record_id == record_id
    ).delete()
    
    # Delete medical record
    db.delete(record)
    db.commit()
    
    # Log medical record deletion
    audit.AuditLogger.log_delete(
        db, current_user.id, "medical_records", record_id,
        old_values, request
    )
    
    return {"message": "Medical record deleted successfully"}

@router.post("/{record_id}/vitals", response_model=schemas.PatientVitals)
async def add_patient_vitals(
    record_id: int,
    vitals_data: schemas.PatientVitalsCreate,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Add vitals to an existing medical record."""
    
    # Verify medical record exists
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Check if vitals already exist
    existing_vitals = db.query(models.PatientVitals).filter(
        models.PatientVitals.medical_record_id == record_id
    ).first()
    
    if existing_vitals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vitals already exist for this medical record"
        )
    
    # Create vitals
    db_vitals = models.PatientVitals(
        medical_record_id=record_id,
        **vitals_data.dict()
    )
    
    db.add(db_vitals)
    db.commit()
    db.refresh(db_vitals)
    
    # Log vitals creation
    audit.AuditLogger.log_create(
        db, current_user.id, "patient_vitals", db_vitals.id,
        {
            "medical_record_id": record_id,
            "temperature": vitals_data.temperature,
            "blood_pressure": f"{vitals_data.blood_pressure_systolic}/{vitals_data.blood_pressure_diastolic}",
            "heart_rate": vitals_data.heart_rate
        },
        request
    )
    
    return db_vitals

@router.put("/{record_id}/vitals", response_model=schemas.PatientVitals)
async def update_patient_vitals(
    record_id: int,
    vitals_data: schemas.PatientVitalsCreate,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update vitals for a medical record."""
    
    # Verify medical record exists
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Get existing vitals
    vitals = db.query(models.PatientVitals).filter(
        models.PatientVitals.medical_record_id == record_id
    ).first()
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vitals not found for this medical record"
        )
    
    # Store old values for audit
    old_values = {
        "temperature": vitals.temperature,
        "blood_pressure_systolic": vitals.blood_pressure_systolic,
        "blood_pressure_diastolic": vitals.blood_pressure_diastolic,
        "heart_rate": vitals.heart_rate,
        "respiratory_rate": vitals.respiratory_rate,
        "weight": vitals.weight,
        "height": vitals.height,
        "oxygen_saturation": vitals.oxygen_saturation,
        "notes": vitals.notes
    }
    
    # Update vitals
    update_data = vitals_data.dict()
    for field, value in update_data.items():
        setattr(vitals, field, value)
    
    db.commit()
    db.refresh(vitals)
    
    # Log vitals update
    audit.AuditLogger.log_update(
        db, current_user.id, "patient_vitals", vitals.id,
        old_values, update_data, request
    )
    
    return vitals

@router.get("/{record_id}/vitals", response_model=schemas.PatientVitals)
async def get_patient_vitals(
    record_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get vitals for a medical record."""
    
    # Verify medical record exists
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    vitals = db.query(models.PatientVitals).filter(
        models.PatientVitals.medical_record_id == record_id
    ).first()
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vitals not found for this medical record"
        )
    
    return vitals

@router.post("/prescriptions", response_model=schemas.Prescription)
async def create_prescription(
    prescription_data: schemas.PrescriptionCreate,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create a new prescription with items."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == prescription_data.patient_id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify doctor exists and is active
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == prescription_data.doctor_id,
        models.Doctor.is_active == True
    ).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or inactive"
        )
    
    # Verify medical record exists if provided
    if prescription_data.medical_record_id:
        record = db.query(models.MedicalRecord).filter(
            models.MedicalRecord.id == prescription_data.medical_record_id
        ).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
    
    # Generate unique prescription ID
    prescription_id = generate_prescription_id()
    
    # Create prescription
    db_prescription = models.Prescription(
        prescription_id=prescription_id,
        patient_id=prescription_data.patient_id,
        doctor_id=prescription_data.doctor_id,
        medical_record_id=prescription_data.medical_record_id,
        prescribed_date=prescription_data.prescribed_date,
        diagnosis=prescription_data.diagnosis,
        instructions=prescription_data.instructions
    )
    
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    # Create prescription items
    for item_data in prescription_data.prescription_items:
        db_item = models.PrescriptionItem(
            prescription_id=db_prescription.id,
            medication_name=item_data.medication_name,
            dosage=item_data.dosage,
            frequency=item_data.frequency,
            duration=item_data.duration,
            instructions=item_data.instructions,
            quantity=item_data.quantity
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_prescription)
    
    # Log prescription creation
    audit.AuditLogger.log_create(
        db, current_user.id, "prescriptions", db_prescription.id,
        {
            "prescription_id": prescription_id,
            "patient_id": prescription_data.patient_id,
            "doctor_id": prescription_data.doctor_id,
            "diagnosis": prescription_data.diagnosis,
            "items_count": len(prescription_data.prescription_items)
        },
        request
    )
    
    return db_prescription

@router.get("/prescriptions", response_model=List[schemas.Prescription])
async def get_prescriptions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[int] = Query(None, description="Filter by doctor ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get prescriptions with optional filtering."""
    
    query = db.query(models.Prescription)
    
    # Apply filters
    if patient_id:
        query = query.filter(models.Prescription.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(models.Prescription.doctor_id == doctor_id)
    
    if is_active is not None:
        query = query.filter(models.Prescription.is_active == is_active)
    
    # Apply pagination
    prescriptions = query.order_by(models.Prescription.prescribed_date.desc()).offset(skip).limit(limit).all()
    
    return prescriptions

@router.get("/prescriptions/{prescription_id}", response_model=schemas.Prescription)
async def get_prescription(
    prescription_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get a specific prescription by ID."""
    
    prescription = db.query(models.Prescription).filter(
        models.Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    return prescription

@router.put("/prescriptions/{prescription_id}/deactivate")
async def deactivate_prescription(
    prescription_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Deactivate a prescription."""
    
    prescription = db.query(models.Prescription).filter(
        models.Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    if not prescription.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription is already inactive"
        )
    
    prescription.is_active = False
    db.commit()
    db.refresh(prescription)
    
    # Log prescription deactivation
    audit.AuditLogger.log_update(
        db, current_user.id, "prescriptions", prescription.id,
        {"is_active": True}, {"is_active": False}, request
    )
    
    return {"message": "Prescription deactivated successfully"}

@router.get("/reports/patient-history/{patient_id}")
async def get_patient_medical_history(
    patient_id: int,
    current_user: models.User = Depends(auth.require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get comprehensive medical history for a patient."""
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get all medical records
    medical_records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.visit_date.desc()).all()
    
    # Get all prescriptions
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(models.Prescription.prescribed_date.desc()).all()
    
    # Get all vitals
    vitals = db.query(models.PatientVitals).join(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.PatientVitals.recorded_at.desc()).all()
    
    return {
        "patient": patient,
        "medical_records": medical_records,
        "prescriptions": prescriptions,
        "vitals": vitals,
        "summary": {
            "total_visits": len(medical_records),
            "total_prescriptions": len(prescriptions),
            "total_vitals_records": len(vitals),
            "last_visit": medical_records[0].visit_date if medical_records else None,
            "last_prescription": prescriptions[0].prescribed_date if prescriptions else None
        }
    }
