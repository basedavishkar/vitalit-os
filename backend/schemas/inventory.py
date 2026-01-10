from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class DrugCategoryEnum(str, Enum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    OINTMENT = "ointment"
    DROPS = "drops"
    INHALER = "inhaler"
    SUPPOSITORY = "suppository"
    OTHER = "other"


class TransactionTypeEnum(str, Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    RETURN = "return"
    ADJUSTMENT = "adjustment"
    EXPIRED = "expired"
    DAMAGED = "damaged"


# Drug Schemas
class DrugBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    generic_name: Optional[str] = Field(None, max_length=200)
    manufacturer: Optional[str] = Field(None, max_length=200)
    category: DrugCategoryEnum
    strength: Optional[str] = Field(None, max_length=50)
    unit: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = None
    unit_price: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    minimum_stock: int = Field(10, ge=0)
    reorder_level: int = Field(20, ge=0)
    maximum_stock: int = Field(1000, ge=0)
    storage_location: Optional[str] = Field(None, max_length=100)
    storage_temperature: Optional[str] = Field(None, max_length=50)
    requires_prescription: bool = False
    controlled_substance: bool = False


class DrugCreate(DrugBase):
    pass


class DrugUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    generic_name: Optional[str] = Field(None, max_length=200)
    manufacturer: Optional[str] = Field(None, max_length=200)
    category: Optional[DrugCategoryEnum] = None
    strength: Optional[str] = Field(None, max_length=50)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)
    description: Optional[str] = None
    unit_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    minimum_stock: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    maximum_stock: Optional[int] = Field(None, ge=0)
    storage_location: Optional[str] = Field(None, max_length=100)
    storage_temperature: Optional[str] = Field(None, max_length=50)
    requires_prescription: Optional[bool] = None
    controlled_substance: Optional[bool] = None
    is_active: Optional[bool] = None


class Drug(DrugBase):
    id: int
    drug_code: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Drug Batch Schemas
class DrugBatchBase(BaseModel):
    drug_id: int
    batch_number: str = Field(..., min_length=1, max_length=100)
    quantity_received: int = Field(..., ge=1)
    manufacture_date: date
    expiry_date: date
    received_date: date
    supplier_name: Optional[str] = Field(None, max_length=200)
    purchase_order_number: Optional[str] = Field(None, max_length=100)
    unit_cost: float = Field(..., ge=0)
    
    @validator('expiry_date')
    def expiry_must_be_after_manufacture(cls, v, values):
        if 'manufacture_date' in values and v <= values['manufacture_date']:
            raise ValueError('Expiry date must be after manufacture date')
        return v


class DrugBatchCreate(DrugBatchBase):
    pass


class DrugBatchUpdate(BaseModel):
    quantity_available: Optional[int] = Field(None, ge=0)
    quantity_sold: Optional[int] = Field(None, ge=0)
    quantity_expired: Optional[int] = Field(None, ge=0)
    quantity_damaged: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class DrugBatch(DrugBatchBase):
    id: int
    quantity_available: int
    quantity_sold: int
    quantity_expired: int
    quantity_damaged: int
    total_cost: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Inventory Transaction Schemas
class InventoryTransactionBase(BaseModel):
    drug_id: int
    batch_id: Optional[int] = None
    transaction_type: TransactionTypeEnum
    quantity: int = Field(..., ge=1)
    unit_price: Optional[float] = Field(None, ge=0)
    reference_number: Optional[str] = Field(None, max_length=100)
    patient_id: Optional[int] = None
    prescription_id: Optional[int] = None
    notes: Optional[str] = None


class InventoryTransactionCreate(InventoryTransactionBase):
    pass


class InventoryTransaction(InventoryTransactionBase):
    id: int
    transaction_id: str
    total_amount: Optional[float] = None
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

