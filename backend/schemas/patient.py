from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum

# Enums
class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

# Patient Schemas
class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    date_of_birth: date
    gender: GenderEnum
    blood_group: Optional[str] = Field(None, max_length=5)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

    @field_validator('phone', 'emergency_contact_phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, or plus sign')
        return v

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    blood_group: Optional[str] = Field(None, max_length=5)
    address: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class Patient(PatientBase):
    id: int
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PatientDocumentBase(BaseModel):
    document_type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class PatientDocumentCreate(PatientDocumentBase):
    pass

class PatientDocument(PatientDocumentBase):
    id: int
    patient_id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    uploaded_by: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    relationship: Optional[str] = Field(None, max_length=50) 