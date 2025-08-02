from datetime import datetime, date, time
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum

# Enums
class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
        values = info.data
        if 'bill_date' in values and v <= values['bill_date']:
            raise ValueError('Due date must be after bill date')
        return v

    @field_validator('total_amount')
    @classmethod
    def validate_total_amount(cls, v, info):
        values = info.data
        if 'subtotal' in values and 'tax_amount' in values and 'discount_amount' in values:
            expected = values['subtotal'] + values['tax_amount'] - values['discount_amount']
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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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
        values = info.data
        if v is not None and 'minimum_quantity' in values and v <= values['minimum_quantity']:
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
    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

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

# Enhanced Authentication Schemas
class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User
    requires_mfa: bool = False

class MFASetupRequest(BaseModel):
    enable: bool

class MFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    backup_codes: List[str]

class MFAVerifyRequest(BaseModel):
    token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str

class UserSession(BaseModel):
    id: int
    session_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    is_active: bool
    class Config:
        from_attributes = True

class UserSecurityInfo(BaseModel):
    mfa_enabled: bool
    last_login: Optional[datetime] = None
    failed_login_attempts: int
    locked_until: Optional[datetime] = None
    password_changed_at: datetime
    active_sessions_count: int

# Patient Document Schemas
class PatientDocumentBase(BaseModel):
    document_type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class PatientDocumentCreate(PatientDocumentBase):
    pass

class PatientDocument(PatientDocumentBase):
    id: int
    patient_id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    uploaded_by: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

# Emergency Contact Schemas
class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    relationship: Optional[str] = Field(None, max_length=50)

# Smart Appointment Schemas
class SmartAppointmentRequest(BaseModel):
    patient_id: int
    doctor_id: int
    preferred_date: date
    preferred_time: Optional[time] = None
    duration_minutes: int = Field(30, ge=15, le=480)
    reason: str = Field(..., min_length=1)
    notes: Optional[str] = None
    appointment_id: Optional[str] = None

# Structured EHR Schemas
class StructuredMedicalRecordCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    visit_date: Optional[datetime] = None
    specialty: str = Field(..., min_length=1, max_length=50)
    structured_data: Dict[str, Any] = Field(..., description="Template-based structured data")
    vitals: Optional[Dict[str, Any]] = None
    follow_up_date: Optional[date] = None
    record_id: Optional[str] = None

# Enhanced Billing Schemas
class AutomatedBillRequest(BaseModel):
    appointment_id: int
    bill_items: List[Dict[str, Any]] = Field(..., description="List of bill items")

class BillCalculationRequest(BaseModel):
    appointment_id: int
    additional_services: Optional[List[Dict[str, Any]]] = None

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
    payment_method: str = Field(..., pattern="^(cash|card|insurance|bank_transfer|check)$")
    amount: float = Field(..., gt=0)
    payment_intent_id: Optional[str] = None

# Communication Schemas
class InternalMessageCreate(BaseModel):
    recipient_id: int
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    priority: str = Field("normal", pattern="^(low|normal|high|urgent)$")

class InternalMessage(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    subject: str
    message: str
    priority: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class NotificationRequest(BaseModel):
    recipient_ids: List[int]
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    notification_type: str = Field(..., pattern="^(email|sms|push|system)$")
    send_email: bool = True
    send_sms: bool = False

class BroadcastMessageRequest(BaseModel):
    target: str = Field(..., pattern="^(staff|patients)$")
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)

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