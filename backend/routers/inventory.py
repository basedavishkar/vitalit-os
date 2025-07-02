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

@router.post("/inventory")
def add_item(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    obj = models.InventoryItem(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/inventory")
def list_items(db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).all()
