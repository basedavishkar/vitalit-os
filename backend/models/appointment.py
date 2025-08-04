from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum


class AppointmentStatusEnum(enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(String(20), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    scheduled_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    reason = Column(Text, nullable=False)
    status = Column(Enum(AppointmentStatusEnum), default=AppointmentStatusEnum.SCHEDULED)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    created_by_user = relationship("User", back_populates="appointments_created")
    
    # Indexes
    __table_args__ = (
        Index('idx_appointment_datetime', 'scheduled_datetime'),
        Index('idx_appointment_status', 'status'),
        Index('idx_appointment_patient', 'patient_id'),
        Index('idx_appointment_doctor', 'doctor_id'),
    ) 