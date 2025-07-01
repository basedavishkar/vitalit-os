from pydantic import BaseModel, Field

class PatientCreate(BaseModel):
    name: str
    age: int = Field(..., ge=0, le=120)
    address: str
    phone: str

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    phone: str
