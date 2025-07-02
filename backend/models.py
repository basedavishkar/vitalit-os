from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String, nullable=True) 

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    specialization = Column(String)
    phone = Column(String)
    email = Column(String)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    datetime = Column(DateTime)
    reason = Column(String)

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    date = Column(DateTime)
    diagnosis = Column(String)
    prescription = Column(String)
    notes = Column(String)

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    date = Column(DateTime)
    amount = Column(Float)
    description = Column(String)
    paid = Column(Boolean, default=False)

class InventoryItem(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    quantity = Column(Integer)
    price = Column(Float)
    expiry_date = Column(DateTime)
    vendor = Column(String)