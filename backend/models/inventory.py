from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Text, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum


class DrugCategoryEnum(str, enum.Enum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    OINTMENT = "ointment"
    DROPS = "drops"
    INHALER = "inhaler"
    SUPPOSITORY = "suppository"
    OTHER = "other"


class TransactionTypeEnum(str, enum.Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    RETURN = "return"
    ADJUSTMENT = "adjustment"
    EXPIRED = "expired"
    DAMAGED = "damaged"


class Drug(Base):
    """Main drug/medicine catalog"""
    __tablename__ = "drugs"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200), index=True)
    manufacturer = Column(String(200))
    category = Column(SQLEnum(DrugCategoryEnum), nullable=False)
    strength = Column(String(50))  # e.g., "500mg", "10ml"
    unit = Column(String(20), nullable=False)  # tablet, bottle, vial, etc.
    description = Column(Text)
    
    # Pricing
    unit_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    
    # Stock thresholds
    minimum_stock = Column(Integer, default=10)
    reorder_level = Column(Integer, default=20)
    maximum_stock = Column(Integer, default=1000)
    
    # Storage
    storage_location = Column(String(100))
    storage_temperature = Column(String(50))  # e.g., "2-8°C", "Room temperature"
    
    # Regulatory
    requires_prescription = Column(Boolean, default=False)
    controlled_substance = Column(Boolean, default=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    batches = relationship("DrugBatch", back_populates="drug", cascade="all, delete-orphan")
    transactions = relationship("InventoryTransaction", back_populates="drug")
    
    # Indexes
    __table_args__ = (
        Index('idx_drug_name', 'name'),
        Index('idx_drug_category', 'category'),
        Index('idx_drug_active', 'is_active'),
    )


class DrugBatch(Base):
    """Individual batches of drugs with expiry tracking"""
    __tablename__ = "drug_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    batch_number = Column(String(100), nullable=False, index=True)
    
    # Quantities
    quantity_received = Column(Integer, nullable=False)
    quantity_available = Column(Integer, nullable=False)
    quantity_sold = Column(Integer, default=0)
    quantity_expired = Column(Integer, default=0)
    quantity_damaged = Column(Integer, default=0)
    
    # Dates
    manufacture_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False, index=True)
    received_date = Column(Date, nullable=False)
    
    # Purchase details
    supplier_name = Column(String(200))
    purchase_order_number = Column(String(100))
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    drug = relationship("Drug", back_populates="batches")
    
    # Indexes
    __table_args__ = (
        Index('idx_batch_expiry', 'expiry_date'),
        Index('idx_batch_drug', 'drug_id'),
        Index('idx_batch_number', 'batch_number'),
        Index('idx_batch_available', 'quantity_available'),
    )


class InventoryTransaction(Base):
    """Track all inventory movements"""
    __tablename__ = "inventory_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(50), unique=True, index=True, nullable=False)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("drug_batches.id"))
    
    transaction_type = Column(SQLEnum(TransactionTypeEnum), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float)
    total_amount = Column(Float)
    
    # Reference
    reference_number = Column(String(100))  # Invoice, PO, Prescription number
    patient_id = Column(Integer, ForeignKey("patients.id"))
    prescription_id = Column(Integer)
    
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    drug = relationship("Drug", back_populates="transactions")
    batch = relationship("DrugBatch")
    created_by_user = relationship("User")
    patient = relationship("Patient")
    
    # Indexes
    __table_args__ = (
        Index('idx_transaction_date', 'created_at'),
        Index('idx_transaction_type', 'transaction_type'),
        Index('idx_transaction_drug', 'drug_id'),
    )

