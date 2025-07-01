from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import models, database, schemas

router = APIRouter()
SessionLocal = database.SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@router.post("/patients")
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    new_patient = models.Patient(**patient.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient
