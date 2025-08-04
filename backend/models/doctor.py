from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    specialization = Column(String(100), nullable=False)
    qualification = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    address = Column(Text)
    consultation_fee = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="doctor")
    
    # Indexes
    __table_args__ = (
        Index('idx_doctor_name', 'first_name', 'last_name'),
        Index('idx_doctor_specialization', 'specialization'),
        Index('idx_doctor_license', 'license_number'),
    ) 