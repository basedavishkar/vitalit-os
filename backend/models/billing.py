from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum


class PaymentStatusEnum(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(String(20), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    bill_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    payment_status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="bills")
    appointment = relationship("Appointment")
    bill_items = relationship("BillItem", back_populates="bill")
    payments = relationship("Payment", back_populates="bill")
    
    # Indexes
    __table_args__ = (
        Index('idx_bill_date', 'bill_date'),
        Index('idx_bill_status', 'payment_status'),
        Index('idx_bill_patient', 'patient_id'),
    )


class BillItem(Base):
    __tablename__ = "bill_items"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    item_name = Column(String(100), nullable=False)
    description = Column(Text)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    bill = relationship("Bill", back_populates="bill_items")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(20), unique=True, index=True, nullable=False)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_date = Column(DateTime, nullable=False)
    reference_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bill = relationship("Bill", back_populates="payments")
    
    # Indexes
    __table_args__ = (
        Index('idx_payment_date', 'payment_date'),
        Index('idx_payment_method', 'payment_method'),
    )


class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    insurance_provider = Column(String(100), nullable=False)
    insurance_number = Column(String(50), nullable=False)
    claim_amount = Column(Float, nullable=False)
    covered_amount = Column(Float, nullable=False)
    patient_responsibility = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    claim_number = Column(String(50))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    bill = relationship("Bill")
    
    # Indexes
    __table_args__ = (
        Index('idx_claim_status', 'status'),
        Index('idx_claim_provider', 'insurance_provider'),
    ) 