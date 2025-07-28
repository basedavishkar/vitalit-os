from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, database, schemas
from backend.routers.auth import get_current_active_user, require_role

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/")
def get_doctors(
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get all doctors (requires authentication)."""
    return db.query(models.Doctor).all()

@router.post("/")
def create_doctor(
    doctor: schemas.DoctorCreate,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Create a new doctor (admin only)."""
    new_doctor = models.Doctor(**doctor.dict())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

@router.get("/{doctor_id}")
def get_doctor(
    doctor_id: int,
    db: Session = Depends(database.get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific doctor by ID."""
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

