from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class DoctorBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    specialization: str = Field(..., min_length=1, max_length=100)
    qualification: str = Field(..., min_length=1, max_length=100)
    license_number: str = Field(..., min_length=1, max_length=50)
    phone: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    address: Optional[str] = None
    consultation_fee: float = Field(0.0, ge=0)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, or plus sign')
        return v


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    specialization: Optional[str] = Field(None, min_length=1, max_length=100)
    qualification: Optional[str] = Field(None, min_length=1, max_length=100)
    license_number: Optional[str] = Field(None, min_length=1, max_length=50)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    consultation_fee: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None


class Doctor(DoctorBase):
    id: int
    doctor_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 