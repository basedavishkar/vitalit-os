from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator, field_validator, Field, ConfigDict
from enum import Enum

# Enums
class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"

class AppointmentStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(..., pattern="^(admin|doctor|nurse|receptionist|staff)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(admin|doctor|nurse|receptionist|staff)$")
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Patient Schemas
class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    date_of_birth: date
    gender: GenderEnum
    blood_group: Optional[str] = Field(None, max_length=5)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

    @field_validator('phone', 'emergency_contact_phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, or plus sign')
        return v

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    blood_group: Optional[str] = Field(None, max_length=5)
    address: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class Patient(PatientBase):
    id: int
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Doctor Schemas
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
        if not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
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
    model_config = ConfigDict(from_attributes=True)

# Appointment Schemas
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
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Medical Record Schemas
class PatientVitalsBase(BaseModel):
    temperature: Optional[float] = Field(None, ge=30, le=45)  # Celsius
    blood_pressure_systolic: Optional[int] = Field(None, ge=70, le=200)
    blood_pressure_diastolic: Optional[int] = Field(None, ge=40, le=130)
    heart_rate: Optional[int] = Field(None, ge=40, le=200)
    respiratory_rate: Optional[int] = Field(None, ge=8, le=40)
    weight: Optional[float] = Field(None, ge=0.5, le=300)  # kg
    height: Optional[float] = Field(None, ge=30, le=250)  # cm
    oxygen_saturation: Optional[float] = Field(None, ge=70, le=100)
    notes: Optional[str] = None

class PatientVitalsCreate(PatientVitalsBase):
    pass

class PatientVitals(PatientVitalsBase):
    id: int
    medical_record_id: int
    recorded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MedicalRecordBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    visit_date: datetime
    chief_complaint: str = Field(..., min_length=1)
    diagnosis: str = Field(..., min_length=1)
    treatment_plan: Optional[str] = None
    prescription_notes: Optional[str] = None
    follow_up_date: Optional[date] = None

class MedicalRecordCreate(MedicalRecordBase):
    vitals: Optional[PatientVitalsCreate] = None

class MedicalRecordUpdate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    appointment_id: Optional[int] = None
    visit_date: Optional[datetime] = None
    chief_complaint: Optional[str] = Field(None, min_length=1)
    diagnosis: Optional[str] = Field(None, min_length=1)
    treatment_plan: Optional[str] = None
    prescription_notes: Optional[str] = None
    follow_up_date: Optional[date] = None

class MedicalRecord(MedicalRecordBase):
    id: int
    record_id: str
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    vitals: Optional[PatientVitals] = None
    model_config = ConfigDict(from_attributes=True)

# Prescription Schemas
class PrescriptionItemBase(BaseModel):
    medication_name: str = Field(..., min_length=1, max_length=100)
    dosage: str = Field(..., min_length=1, max_length=50)
    frequency: str = Field(..., min_length=1, max_length=50)
    duration: str = Field(..., min_length=1, max_length=50)
    instructions: Optional[str] = None
    quantity: int = Field(1, ge=1)

class PrescriptionItemCreate(PrescriptionItemBase):
    pass

class PrescriptionItem(PrescriptionItemBase):
    id: int
    prescription_id: int
    model_config = ConfigDict(from_attributes=True)

class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    medical_record_id: Optional[int] = None
    prescribed_date: datetime
    diagnosis: str = Field(..., min_length=1)
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    prescription_items: List[PrescriptionItemCreate]

class PrescriptionUpdate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    medical_record_id: Optional[int] = None
    prescribed_date: Optional[datetime] = None
    diagnosis: Optional[str] = Field(None, min_length=1)
    instructions: Optional[str] = None
    is_active: Optional[bool] = None

class Prescription(PrescriptionBase):
    id: int
    prescription_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    prescription_items: List[PrescriptionItem] = []
    model_config = ConfigDict(from_attributes=True)

# Billing Schemas
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
    model_config = ConfigDict(from_attributes=True)

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
        if 'bill_date' in info.data and v <= info.data['bill_date']:
            raise ValueError('Due date must be after bill date')
        return v

    @field_validator('total_amount')
    @classmethod
    def validate_total_amount(cls, v, info):
        if 'subtotal' in info.data and 'tax_amount' in info.data and 'discount_amount' in info.data:
            expected = info.data['subtotal'] + info.data['tax_amount'] - info.data['discount_amount']
            if abs(v - expected) > 0.01:  # Allow small floating point differences
                raise ValueError('Total amount must equal subtotal + tax - discount')
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
    model_config = ConfigDict(from_attributes=True)

# Payment Schemas
class PaymentBase(BaseModel):
    bill_id: int
    amount: float = Field(..., ge=0.01)
    payment_method: str = Field(..., pattern="^(cash|card|insurance|bank_transfer|check)$")
    payment_date: datetime
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    payment_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Inventory Schemas
class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: str = Field(..., pattern="^(medicine|equipment|supplies)$")
    unit: str = Field(..., min_length=1, max_length=20)
    current_quantity: int = Field(0, ge=0)
    minimum_quantity: int = Field(0, ge=0)
    maximum_quantity: Optional[int] = Field(None, ge=0)
    unit_price: float = Field(..., ge=0)
    supplier: Optional[str] = Field(None, max_length=100)
    expiry_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=100)

    @field_validator('maximum_quantity')
    @classmethod
    def validate_max_quantity(cls, v, info):
        if v is not None and 'minimum_quantity' in info.data and v <= info.data['minimum_quantity']:
            raise ValueError('Maximum quantity must be greater than minimum quantity')
        return v

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(medicine|equipment|supplies)$")
    unit: Optional[str] = Field(None, min_length=1, max_length=20)
    current_quantity: Optional[int] = Field(None, ge=0)
    minimum_quantity: Optional[int] = Field(None, ge=0)
    maximum_quantity: Optional[int] = Field(None, ge=0)
    unit_price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=100)
    expiry_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class InventoryItem(InventoryItemBase):
    id: int
    item_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Inventory Transaction Schemas
class InventoryTransactionBase(BaseModel):
    item_id: int
    transaction_type: str = Field(..., pattern="^(in|out|adjustment)$")
    quantity: int = Field(..., ge=1)
    unit_price: Optional[float] = Field(None, ge=0)
    total_amount: Optional[float] = Field(None, ge=0)
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class InventoryTransactionCreate(InventoryTransactionBase):
    pass

class InventoryTransaction(InventoryTransactionBase):
    id: int
    transaction_id: str
    created_by: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Response Schemas
class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None