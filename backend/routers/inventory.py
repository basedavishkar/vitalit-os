from fastapi import APIRouter, Depends, HTTPException
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

#  Create
@router.post("/inventory", response_model=schemas.Inventory)
def add_item(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    obj = models.InventoryItem(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

#  Read All
@router.get("/inventory", response_model=list[schemas.Inventory])
def list_items(db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).all()

#  Read One
@router.get("/inventory/{item_id}", response_model=schemas.Inventory)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Update
@router.put("/inventory/{item_id}", response_model=schemas.Inventory)
def update_item(item_id: int, updated: schemas.InventoryCreate, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in updated.dict().items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

#  Delete
@router.delete("/inventory/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"detail": "Item deleted successfully"}
