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

@router.post("/bills")
def create_bill(bill: schemas.BillCreate, db: Session = Depends(get_db)):
    obj = models.Bill(**bill.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/bills")
def list_bills(db: Session = Depends(get_db)):
    return db.query(models.Bill).all()
