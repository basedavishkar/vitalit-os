from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from pydantic.config import ConfigDict

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    address: str
    contact: str

class Patient(PatientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

# ---- Bill ----
class BillCreate(BaseModel):
    patient_id: int
    date: datetime
    amount: float
    description: str
    paid: bool = False

class Bill(BillCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ---- InventoryItem ----
class InventoryCreate(BaseModel):
    name: str
    quantity: int
    price: float
    expiry_date: datetime
    vendor: str

class Inventory(InventoryCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ---- Authentication ----
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    is_active: bool = True
    role: str = "staff"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)