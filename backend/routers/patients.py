from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
from backend import models, database, schemas

router = APIRouter()
SessionLocal = database.SessionLocal

# ─────────────────────────────
# Dependency
# ─────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────
# Routes
# ─────────────────────────────

@router.get("/patients", response_model=List[schemas.Patient])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@router.post("/patients", response_model=schemas.Patient)
def create_patient(
    patient: schemas.PatientCreate,      
    db: Session = Depends(get_db)
):
    new_patient = models.Patient(**patient.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient



@router.get("/patients/{patient_id}", response_model=schemas.Patient)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
