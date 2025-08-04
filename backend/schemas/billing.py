from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


class BillItemBase(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    quantity: int = Field(1, ge=1)
    unit_price: float = Field(..., ge=0)
    total_price: float = Field(..., ge=0)


class BillItemCreate(BillItemBase):
    pass


class BillItem(BillItemBase):
    id: int
    bill_id: int

    class Config:
        from_attributes = True


class BillBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    bill_date: datetime
    due_date: datetime
    subtotal: float = Field(..., ge=0)
    tax_amount: float = Field(0.0, ge=0)
    discount_amount: float = Field(0.0, ge=0)
    total_amount: float = Field(..., ge=0)
    notes: Optional[str] = None

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v, info):
        bill_date = info.data.get('bill_date')
        if bill_date and v <= bill_date:
            raise ValueError('Due date must be after bill date')
        return v

    @field_validator('total_amount')
    @classmethod
    def validate_total_amount(cls, v, info):
        subtotal = info.data.get('subtotal', 0)
        tax_amount = info.data.get('tax_amount', 0)
        discount_amount = info.data.get('discount_amount', 0)
        calculated_total = subtotal + tax_amount - discount_amount
        if abs(v - calculated_total) > 0.01:  # Allow small floating point differences
            raise ValueError(
                f'Total amount ({v}) must equal subtotal ({subtotal}) + '
                f'tax ({tax_amount}) - discount ({discount_amount}) = {calculated_total}'
            )
        return v


class BillCreate(BillBase):
    bill_items: List[BillItemCreate]


class BillUpdate(BaseModel):
    patient_id: Optional[int] = None
    appointment_id: Optional[int] = None
    bill_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    subtotal: Optional[float] = Field(None, ge=0)
    tax_amount: Optional[float] = Field(None, ge=0)
    discount_amount: Optional[float] = Field(None, ge=0)
    total_amount: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class Bill(BillBase):
    id: int
    bill_id: str
    paid_amount: float
    payment_status: PaymentStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    bill_items: List[BillItem] = []

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    bill_id: int
    amount: float = Field(..., ge=0.01)
    payment_method: str = Field(
        ..., pattern="^(cash|card|insurance|bank_transfer|check)$"
    )
    payment_date: datetime
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class Payment(PaymentBase):
    id: int
    payment_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class InsuranceClaimRequest(BaseModel):
    bill_id: int
    insurance_provider: str = Field(..., min_length=1, max_length=100)
    insurance_number: str = Field(..., min_length=1, max_length=50)


class PaymentIntentRequest(BaseModel):
    bill_id: int
    amount: float = Field(..., gt=0)
    currency: str = Field("usd", min_length=3, max_length=3)


class PaymentProcessRequest(BaseModel):
    bill_id: int
    payment_method: str = Field(
        ..., pattern="^(cash|card|insurance|bank_transfer|check)$"
    )
    amount: float = Field(..., gt=0)
    payment_intent_id: Optional[str] = None


class AutomatedBillRequest(BaseModel):
    appointment_id: int
    bill_items: List[dict] = Field(..., description="List of bill items")


class BillCalculationRequest(BaseModel):
    appointment_id: int
    additional_services: Optional[List[dict]] = None 