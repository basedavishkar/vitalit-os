from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Date, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum


class GenderEnum(enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    blood_group = Column(String(5))
    address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100))
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relationship = Column(String(50))
    insurance_provider = Column(String(100))
    insurance_number = Column(String(50))
    allergies = Column(Text)
    medical_history = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    bills = relationship("Bill", back_populates="patient")
    
    # Indexes
    __table_args__ = (
        Index('idx_patient_name', 'first_name', 'last_name'),
        Index('idx_patient_phone', 'phone'),
        Index('idx_patient_email', 'email'),
    )


class PatientDocument(Base):
    __tablename__ = "patient_documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    document_type = Column(String(50), nullable=False)
    description = Column(Text)
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient")
    uploaded_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_document_type', 'document_type'),
        Index('idx_uploaded_at', 'uploaded_at'),
    ) 