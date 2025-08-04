from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class AppointmentStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    scheduled_datetime: datetime
    duration_minutes: int = Field(30, ge=15, le=480)  # 15 min to 8 hours
    reason: str = Field(..., min_length=1)
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    scheduled_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    reason: Optional[str] = Field(None, min_length=1)
    status: Optional[AppointmentStatusEnum] = None
    notes: Optional[str] = None


class Appointment(AppointmentBase):
    id: int
    appointment_id: str
    status: AppointmentStatusEnum
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SmartAppointmentRequest(BaseModel):
    patient_id: int
    doctor_id: int
    preferred_date: date
    preferred_time: Optional[time] = None
    duration_minutes: int = Field(30, ge=15, le=480)
    reason: str = Field(..., min_length=1)
    notes: Optional[str] = None
    appointment_id: Optional[str] = None 