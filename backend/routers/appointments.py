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

@router.post("/appointments")
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    obj = models.Appointment(**appointment.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/appointments")
def list_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).all()
