from pydantic import BaseModel

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
