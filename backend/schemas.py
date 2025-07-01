from pydantic import BaseModel, ConfigDict


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
