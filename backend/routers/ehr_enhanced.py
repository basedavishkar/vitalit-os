from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from backend import database, models, schemas, audit
from backend.auth_enhanced import require_doctor

router = APIRouter(prefix="/ehr", tags=["Enhanced Electronic Health Records"])


class EHRTemplateManager:
    """Manage EHR templates for different specialties"""
    
    TEMPLATES = {
        "general": {
            "chief_complaint": "",
            "history_of_present_illness": "",
            "past_medical_history": "",
            "medications": "",
            "allergies": "",
            "family_history": "",
            "social_history": "",
            "review_of_systems": "",
            "physical_examination": "",
            "assessment": "",
            "plan": ""
        },
        "cardiology": {
            "chief_complaint": "",
            "cardiac_symptoms": "",
            "risk_factors": "",
            "medications": "",
            "physical_examination": {
                "blood_pressure": "",
                "heart_rate": "",
                "heart_sounds": "",
                "edema": ""
            },
            "ecg_findings": "",
            "assessment": "",
            "plan": ""
        },
        "pediatrics": {
            "chief_complaint": "",
            "birth_history": "",
            "developmental_milestones": "",
            "immunizations": "",
            "growth_parameters": {
                "height": "",
                "weight": "",
                "head_circumference": ""
            },
            "physical_examination": "",
            "assessment": "",
            "plan": ""
        }
    }
    
    @staticmethod
    def get_template(specialty: str) -> Dict[str, Any]:
        """Get EHR template for specialty"""
        return EHRTemplateManager.TEMPLATES.get(specialty, EHRTemplateManager.TEMPLATES["general"])
    
    @staticmethod
    def get_available_templates() -> List[str]:
        """Get list of available templates"""
        return list(EHRTemplateManager.TEMPLATES.keys())


class ProgressTracker:
    """Track patient progress over time"""
    
    @staticmethod
    def get_patient_progress(
        db: Session,
        patient_id: int,
        condition: Optional[str] = None,
        months: int = 12
    ) -> List[Dict[str, Any]]:
        """Get patient progress for specific condition"""
        start_date = datetime.utcnow() - timedelta(days=months * 30)
        
        records = db.query(models.MedicalRecord).filter(
            and_(
                models.MedicalRecord.patient_id == patient_id,
                models.MedicalRecord.visit_date >= start_date
            )
        ).order_by(models.MedicalRecord.visit_date).all()
        
        if condition:
            records = [r for r in records if condition.lower() in r.diagnosis.lower()]
        
        progress_data = []
        for record in records:
            progress_data.append({
                "date": record.visit_date,
                "diagnosis": record.diagnosis,
                "treatment_plan": record.treatment_plan,
                "doctor": f"Dr. {record.doctor.first_name} {record.doctor.last_name}",
                "vitals": record.vitals.__dict__ if record.vitals else None
            })
        
        return progress_data


@router.get("/templates")
async def get_ehr_templates(
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get available EHR templates"""
    return {
        "available_templates": EHRTemplateManager.get_available_templates(),
        "templates": EHRTemplateManager.TEMPLATES
    }


@router.get("/templates/{specialty}")
async def get_ehr_template(
    specialty: str,
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get specific EHR template"""
    template = EHRTemplateManager.get_template(specialty)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"specialty": specialty, "template": template}


@router.post("/records/structured", response_model=schemas.MedicalRecord)
async def create_structured_record(
    record_data: schemas.StructuredMedicalRecordCreate,
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    """Create structured medical record using templates"""
    # Validate patient and doctor
    patient = db.query(models.Patient).filter(models.Patient.id == record_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doctor = db.query(models.Doctor).filter(models.Doctor.id == record_data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create medical record
    record = models.MedicalRecord(
        record_id=record_data.record_id or f"MR{datetime.now().strftime('%Y%m%d%H%M%S')}",
        patient_id=record_data.patient_id,
        doctor_id=record_data.doctor_id,
        appointment_id=record_data.appointment_id,
        visit_date=record_data.visit_date or datetime.utcnow(),
        chief_complaint=record_data.structured_data.get("chief_complaint", ""),
        diagnosis=record_data.structured_data.get("assessment", ""),
        treatment_plan=record_data.structured_data.get("plan", ""),
        prescription_notes=record_data.structured_data.get("medications", ""),
        follow_up_date=record_data.follow_up_date,
        created_by=current_user.id
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # Create vitals if provided
    if record_data.vitals:
        vitals = models.PatientVitals(
            medical_record_id=record.id,
            temperature=record_data.vitals.get("temperature"),
            blood_pressure_systolic=record_data.vitals.get("blood_pressure_systolic"),
            blood_pressure_diastolic=record_data.vitals.get("blood_pressure_diastolic"),
            heart_rate=record_data.vitals.get("heart_rate"),
            respiratory_rate=record_data.vitals.get("respiratory_rate"),
            weight=record_data.vitals.get("weight"),
            height=record_data.vitals.get("height"),
            oxygen_saturation=record_data.vitals.get("oxygen_saturation"),
            notes=record_data.vitals.get("notes")
        )
        db.add(vitals)
        db.commit()
    
    # Log record creation
    audit.AuditLogger.log_action(
        db, current_user.id, "STRUCTURED_RECORD_CREATED", "medical_records",
        record_id=record.id,
        new_values={
            "patient_id": record_data.patient_id,
            "doctor_id": record_data.doctor_id,
            "specialty": record_data.specialty
        },
        request=request
    )
    
    return record


@router.get("/progress/{patient_id}")
async def get_patient_progress(
    patient_id: int,
    condition: Optional[str] = Query(None),
    months: int = Query(12, ge=1, le=60),
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get patient progress tracking"""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    progress_data = ProgressTracker.get_patient_progress(db, patient_id, condition, months)
    
    return {
        "patient_id": patient_id,
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "condition": condition,
        "months_tracked": months,
        "progress": progress_data,
        "total_visits": len(progress_data)
    }


@router.get("/analytics/conditions")
async def get_condition_analytics(
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Get analytics on common conditions"""
    # Get most common diagnoses
    common_diagnoses = db.query(
        models.MedicalRecord.diagnosis,
        func.count(models.MedicalRecord.id).label('count')
    ).group_by(models.MedicalRecord.diagnosis).order_by(
        func.count(models.MedicalRecord.id).desc()
    ).limit(10).all()
    
    # Get conditions by age group
    age_group_conditions = db.query(
        func.case(
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 18, 'Under 18'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 30, '18-29'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 50, '30-49'),
            (func.extract('year', func.age(models.Patient.date_of_birth)) < 65, '50-64'),
            else_='65+'
        ).label('age_group'),
        models.MedicalRecord.diagnosis,
        func.count(models.MedicalRecord.id).label('count')
    ).join(models.Patient).group_by('age_group', models.MedicalRecord.diagnosis).all()
    
    return {
        "common_diagnoses": [{"diagnosis": d.diagnosis, "count": d.count} for d in common_diagnoses],
        "age_group_conditions": [
            {
                "age_group": c.age_group,
                "diagnosis": c.diagnosis,
                "count": c.count
            }
            for c in age_group_conditions
        ]
    }


@router.get("/records/{record_id}/export")
async def export_medical_record(
    record_id: int,
    format: str = Query("json"),
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Export medical record in different formats"""
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Prepare record data
    record_data = {
        "record_id": record.record_id,
        "patient": {
            "name": f"{record.patient.first_name} {record.patient.last_name}",
            "patient_id": record.patient.patient_id,
            "date_of_birth": record.patient.date_of_birth,
            "gender": record.patient.gender.value
        },
        "doctor": {
            "name": f"Dr. {record.doctor.first_name} {record.doctor.last_name}",
            "specialization": record.doctor.specialization
        },
        "visit_date": record.visit_date,
        "chief_complaint": record.chief_complaint,
        "diagnosis": record.diagnosis,
        "treatment_plan": record.treatment_plan,
        "prescription_notes": record.prescription_notes,
        "follow_up_date": record.follow_up_date,
        "vitals": record.vitals.__dict__ if record.vitals else None,
        "created_at": record.created_at
    }
    
    if format == "json":
        return record_data
    elif format == "html":
        # Generate HTML report
        html_content = f"""
        <html>
        <head><title>Medical Record - {record.record_id}</title></head>
        <body>
            <h1>Medical Record</h1>
            <h2>Patient Information</h2>
            <p><strong>Name:</strong> {record_data['patient']['name']}</p>
            <p><strong>Patient ID:</strong> {record_data['patient']['patient_id']}</p>
            <p><strong>Date of Birth:</strong> {record_data['patient']['date_of_birth']}</p>
            <p><strong>Gender:</strong> {record_data['patient']['gender']}</p>
            
            <h2>Visit Information</h2>
            <p><strong>Date:</strong> {record.visit_date}</p>
            <p><strong>Doctor:</strong> {record_data['doctor']['name']}</p>
            <p><strong>Specialization:</strong> {record_data['doctor']['specialization']}</p>
            
            <h2>Clinical Information</h2>
            <p><strong>Chief Complaint:</strong> {record.chief_complaint}</p>
            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
            <p><strong>Treatment Plan:</strong> {record.treatment_plan}</p>
            <p><strong>Prescription Notes:</strong> {record.prescription_notes}</p>
            
            <h2>Follow-up</h2>
            <p><strong>Follow-up Date:</strong> {record.follow_up_date or 'Not scheduled'}</p>
        </body>
        </html>
        """
        return {"html": html_content}
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")


@router.get("/records/search")
async def search_medical_records(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    diagnosis: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(database.get_db)
):
    """Search medical records with filters"""
    query = db.query(models.MedicalRecord)
    
    if patient_id:
        query = query.filter(models.MedicalRecord.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(models.MedicalRecord.doctor_id == doctor_id)
    
    if diagnosis:
        query = query.filter(models.MedicalRecord.diagnosis.ilike(f"%{diagnosis}%"))
    
    if start_date:
        query = query.filter(models.MedicalRecord.visit_date >= start_date)
    
    if end_date:
        query = query.filter(models.MedicalRecord.visit_date <= end_date)
    
    records = query.order_by(models.MedicalRecord.visit_date.desc()).all()
    
    return {
        "total_records": len(records),
        "records": [
            {
                "id": record.id,
                "record_id": record.record_id,
                "patient_name": f"{record.patient.first_name} {record.patient.last_name}",
                "doctor_name": f"Dr. {record.doctor.first_name} {record.doctor.last_name}",
                "visit_date": record.visit_date,
                "diagnosis": record.diagnosis,
                "chief_complaint": record.chief_complaint
            }
            for record in records
        ]
    } 