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

@router.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    return db.query(models.Doctor).all()
@router.post("/doctors")
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    new_doctor = models.Doctor(**doctor.dict())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor  # ✅ this line was cut off

