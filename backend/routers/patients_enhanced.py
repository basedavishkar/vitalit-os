import os
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
import shutil
import uuid

import database, models, schemas, audit
from backend.auth_enhanced import get_current_active_user, require_staff

router = APIRouter(prefix="/patients", tags=["Enhanced Patient Management"])


@router.get("/", response_model=schemas.PaginatedResponse)
async def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    blood_group: Optional[str] = Query(None),
    age_min: Optional[int] = Query(None, ge=0),
    age_max: Optional[int] = Query(None, ge=0),
    has_insurance: Optional[bool] = Query(None),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Advanced patient search with filtering"""
    query = db.query(models.Patient)
    
    # Search functionality
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Patient.first_name.ilike(search_term),
                models.Patient.last_name.ilike(search_term),
                models.Patient.patient_id.ilike(search_term),
                models.Patient.phone.ilike(search_term),
                models.Patient.email.ilike(search_term)
            )
        )
    
    # Gender filter
    if gender:
        query = query.filter(models.Patient.gender == gender)
    
    # Blood group filter
    if blood_group:
        query = query.filter(models.Patient.blood_group == blood_group)
    
    # Age filters
    if age_min:
        max_date = date.today().replace(year=date.today().year - age_min)
        query = query.filter(models.Patient.date_of_birth <= max_date)
    
    if age_max:
        min_date = date.today().replace(year=date.today().year - age_max)
        query = query.filter(models.Patient.date_of_birth >= min_date)
    
    # Insurance filter
    if has_insurance is not None:
        if has_insurance:
            query = query.filter(models.Patient.insurance_provider.isnot(None))
        else:
            query = query.filter(models.Patient.insurance_provider.is_(None))
    
    # Get total count
    total = query.count()
    
    # Pagination
    patients = query.offset(skip).limit(limit).all()
    
    # Calculate pages
    pages = (total + limit - 1) // limit
    
    return schemas.PaginatedResponse(
        items=[patient.__dict__ for patient in patients],
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{patient_id}/history", response_model=List[schemas.MedicalRecord])
async def get_patient_history(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get complete medical history for a patient"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.visit_date.desc()).all()
    
    return records


@router.get("/{patient_id}/timeline")
async def get_patient_timeline(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient timeline with all events"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    timeline = []
    
    # Add patient registration
    timeline.append({
        "date": patient.created_at,
        "type": "registration",
        "title": "Patient Registered",
        "description": f"Patient {patient.first_name} {patient.last_name} registered"
    })
    
    # Add appointments
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).order_by(models.Appointment.scheduled_datetime.desc()).all()
    
    for appointment in appointments:
        timeline.append({
            "date": appointment.scheduled_datetime,
            "type": "appointment",
            "title": f"Appointment - {appointment.status.value}",
            "description": f"Appointment with Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}",
            "data": appointment
        })
    
    # Add medical records
    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.visit_date.desc()).all()
    
    for record in records:
        timeline.append({
            "date": record.visit_date,
            "type": "medical_record",
            "title": f"Medical Record - {record.diagnosis}",
            "description": f"Visit with Dr. {record.doctor.first_name} {record.doctor.last_name}",
            "data": record
        })
    
    # Add bills
    bills = db.query(models.Bill).filter(
        models.Bill.patient_id == patient_id
    ).order_by(models.Bill.bill_date.desc()).all()
    
    for bill in bills:
        timeline.append({
            "date": bill.bill_date,
            "type": "bill",
            "title": f"Bill - ${bill.total_amount}",
            "description": f"Bill {bill.bill_id} - {bill.payment_status.value}",
            "data": bill
        })
    
    # Sort timeline by date
    timeline.sort(key=lambda x: x["date"], reverse=True)
    
    return timeline


@router.post("/{patient_id}/documents")
async def upload_patient_document(
    patient_id: int,
    file: UploadFile = File(...),
    document_type: str = Query(..., description="Type of document (xray, lab_report, prescription, etc.)"),
    description: Optional[str] = Query(None),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Upload patient document"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, GIF, PDF, TXT"
        )
    
    # Create upload directory
    upload_dir = f"uploads/patients/{patient_id}/documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document record
    document = models.PatientDocument(
        patient_id=patient_id,
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        document_type=document_type,
        description=description,
        uploaded_by=current_user.id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Log document upload
    audit.AuditLogger.log_action(
        db, current_user.id, "DOCUMENT_UPLOADED", "patient_documents",
        record_id=document.id,
        new_values={
            "filename": filename,
            "document_type": document_type,
            "patient_id": patient_id
        }
    )
    
    return {"message": "Document uploaded successfully", "document_id": document.id}


@router.get("/{patient_id}/documents")
async def get_patient_documents(
    patient_id: int,
    document_type: Optional[str] = Query(None),
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient documents"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = db.query(models.PatientDocument).filter(
        models.PatientDocument.patient_id == patient_id
    )
    
    if document_type:
        query = query.filter(models.PatientDocument.document_type == document_type)
    
    documents = query.order_by(models.PatientDocument.uploaded_at.desc()).all()
    
    return documents


@router.get("/analytics/overview")
async def get_patient_analytics(
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient analytics overview"""
    # Total patients
    total_patients = db.query(models.Patient).count()
    
    # Patients by gender
    gender_stats = db.query(
        models.Patient.gender,
        func.count(models.Patient.id)
    ).group_by(models.Patient.gender).all()
    
    # Patients by age group
    age_groups = db.query(
        func.case(
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 18, 'Under 18'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 30, '18-29'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 50, '30-49'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 65, '50-64'),
            else_='65+'
        ).label('age_group'),
        func.count(models.Patient.id)
    ).group_by('age_group').all()
    
    # Patients with insurance
    with_insurance = db.query(models.Patient).filter(
        models.Patient.insurance_provider.isnot(None)
    ).count()
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_registrations = db.query(models.Patient).filter(
        models.Patient.created_at >= thirty_days_ago
    ).count()
    
    return {
        "total_patients": total_patients,
        "gender_distribution": dict(gender_stats),
        "age_distribution": dict(age_groups),
        "with_insurance": with_insurance,
        "without_insurance": total_patients - with_insurance,
        "recent_registrations": recent_registrations
    }


@router.get("/{patient_id}/emergency-contacts")
async def get_emergency_contacts(
    patient_id: int,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db)
):
    """Get patient emergency contacts"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "name": patient.emergency_contact_name,
        "phone": patient.emergency_contact_phone,
        "relationship": patient.emergency_contact_relationship
    }


@router.put("/{patient_id}/emergency-contacts")
async def update_emergency_contacts(
    patient_id: int,
    emergency_data: schemas.EmergencyContactUpdate,
    current_user: models.User = Depends(require_staff),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Update patient emergency contacts"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update emergency contact info
    if emergency_data.name:
        patient.emergency_contact_name = emergency_data.name
    if emergency_data.phone:
        patient.emergency_contact_phone = emergency_data.phone
    if emergency_data.relationship:
        patient.emergency_contact_relationship = emergency_data.relationship
    
    db.commit()
    
    # Log update
    audit.AuditLogger.log_action(
        db, current_user.id, "EMERGENCY_CONTACTS_UPDATED", "patients",
        record_id=patient_id,
        new_values=emergency_data.dict(),
        request=request
    )
    
    return {"message": "Emergency contacts updated successfully"} 