from datetime import datetime
from pydantic import BaseModel
from pydantic.config import ConfigDict  # ✅ CORRECT



class PatientBase(BaseModel):
    name: str
    age: int
    gender: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int

    class Config:
        orm_mode = True

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    phone: str
    email: str

class Doctor(DoctorCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    datetime: datetime
    reason: str

class Appointment(AppointmentCreate):
    id: int
    class Config:
        from_attributes = True

# ---- MedicalRecord ----
class MedicalRecordCreate(BaseModel):
    patient_id: int
    doctor_id: int
    date: datetime
    diagnosis: str
    prescription: str
    notes: str

class MedicalRecord(MedicalRecordCreate):
    id: int
    class Config:
        from_attributes = True

# ---- Bill ----
class BillCreate(BaseModel):
    patient_id: int
    date: datetime
    amount: float
    description: str
    paid: bool = False

class Bill(BillCreate):
    id: int
    class Config:
        from_attributes = True

# ---- InventoryItem ----
class InventoryCreate(BaseModel):
    name: str
    quantity: int
    price: float
    expiry_date: datetime
    vendor: str

class Inventory(InventoryCreate):
    id: int
    class Config:
        from_attributes = True