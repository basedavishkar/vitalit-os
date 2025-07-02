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

@router.post("/records")
def create_record(record: schemas.MedicalRecordCreate, db: Session = Depends(get_db)):
    obj = models.MedicalRecord(**record.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/records")
def list_records(db: Session = Depends(get_db)):
    return db.query(models.MedicalRecord).all()
