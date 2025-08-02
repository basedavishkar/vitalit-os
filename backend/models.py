from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text, Date, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class GenderEnum(enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class PaymentStatusEnum(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    CANCELLED = "cancelled"

class AppointmentStatusEnum(enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="staff")  # admin, doctor, nurse, receptionist, staff
    is_active = Column(Boolean, default=True)
    
    # MFA and security
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(32))  # TOTP secret
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    password_changed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Session management
    last_login = Column(DateTime(timezone=True))
    last_activity = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments_created = relationship("Appointment", back_populates="created_by_user")
    medical_records_created = relationship("MedicalRecord", back_populates="created_by_user")
    sessions = relationship("UserSession", back_populates="user")


class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    refresh_token = Column(String(255), unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    # Indexes
    __table_args__ = (
        Index('idx_session_token', 'session_token'),
        Index('idx_refresh_token', 'refresh_token'),
        Index('idx_session_expires', 'expires_at'),
    )

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital patient ID
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
    medical_records = relationship("MedicalRecord", back_populates="patient")
    bills = relationship("Bill", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    
    # Indexes
    __table_args__ = (
        Index('idx_patient_name', 'first_name', 'last_name'),
        Index('idx_patient_phone', 'phone'),
    )

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital doctor ID
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
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    
    # Indexes
    __table_args__ = (
        Index('idx_doctor_name', 'first_name', 'last_name'),
        Index('idx_doctor_specialization', 'specialization'),
    )

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital appointment ID
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
    )


class PatientDocument(Base):
    __tablename__ = "patient_documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    document_type = Column(String(50), nullable=False)  # xray, lab_report, prescription, etc.
    description = Column(Text)
    file_size = Column(Integer)  # in bytes
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient")
    uploaded_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_document_patient', 'patient_id'),
        Index('idx_document_type', 'document_type'),
        Index('idx_document_uploaded', 'uploaded_at'),
    )

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital record ID
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    visit_date = Column(DateTime, nullable=False)
    chief_complaint = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment_plan = Column(Text)
    prescription_notes = Column(Text)
    follow_up_date = Column(Date)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    appointment = relationship("Appointment")
    created_by_user = relationship("User", back_populates="medical_records_created")
    vitals = relationship("PatientVitals", back_populates="medical_record")
    
    # Indexes
    __table_args__ = (
        Index('idx_medical_record_date', 'visit_date'),
        Index('idx_medical_record_patient', 'patient_id'),
    )

class PatientVitals(Base):
    __tablename__ = "patient_vitals"
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=False)
    temperature = Column(Float)  # Celsius
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    heart_rate = Column(Integer)
    respiratory_rate = Column(Integer)
    weight = Column(Float)  # kg
    height = Column(Float)  # cm
    oxygen_saturation = Column(Float)
    notes = Column(Text)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="vitals")

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String(20), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    prescribed_date = Column(DateTime, nullable=False)
    diagnosis = Column(Text, nullable=False)
    instructions = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    medical_record = relationship("MedicalRecord")
    prescription_items = relationship("PrescriptionItem", back_populates="prescription")
    
    # Indexes
    __table_args__ = (
        Index('idx_prescription_date', 'prescribed_date'),
        Index('idx_prescription_patient', 'patient_id'),
    )

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False)
    frequency = Column(String(50), nullable=False)
    duration = Column(String(50), nullable=False)
    instructions = Column(Text)
    quantity = Column(Integer, default=1)
    
    # Relationships
    prescription = relationship("Prescription", back_populates="prescription_items")

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital bill ID
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
    payment_method = Column(String(50), nullable=False)  # cash, card, insurance, etc.
    payment_date = Column(DateTime, nullable=False)
    reference_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bill = relationship("Bill", back_populates="payments")
    
    # Indexes
    __table_args__ = (
        Index('idx_payment_bill', 'bill_id'),
        Index('idx_payment_date', 'payment_date'),
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
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, denied
    claim_number = Column(String(50))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    bill = relationship("Bill")
    
    # Indexes
    __table_args__ = (
        Index('idx_claim_bill', 'bill_id'),
        Index('idx_claim_status', 'status'),
        Index('idx_claim_provider', 'insurance_provider'),
    )


class InternalMessage(Base):
    __tablename__ = "internal_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_message_sender', 'sender_id'),
        Index('idx_message_recipient', 'recipient_id'),
        Index('idx_message_read', 'is_read'),
        Index('idx_message_created', 'created_at'),
    )


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # email, sms, push, system
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id])
    sender = relationship("User", foreign_keys=[sender_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_recipient', 'recipient_id'),
        Index('idx_notification_type', 'notification_type'),
        Index('idx_notification_read', 'is_read'),
        Index('idx_notification_created', 'created_at'),
    )

class InventoryItem(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(20), unique=True, index=True, nullable=False)  # Hospital item ID
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # medicine, equipment, supplies
    unit = Column(String(20), nullable=False)  # pieces, bottles, boxes, etc.
    current_quantity = Column(Integer, default=0)
    minimum_quantity = Column(Integer, default=0)  # reorder level
    maximum_quantity = Column(Integer)
    unit_price = Column(Float, nullable=False)
    supplier = Column(String(100))
    expiry_date = Column(Date)
    location = Column(String(100))  # storage location
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transactions = relationship("InventoryTransaction", back_populates="item")
    
    # Indexes
    __table_args__ = (
        Index('idx_inventory_category', 'category'),
        Index('idx_inventory_expiry', 'expiry_date'),
        Index('idx_inventory_quantity', 'current_quantity'),
    )

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(20), unique=True, index=True, nullable=False)
    item_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # in, out, adjustment
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float)
    total_amount = Column(Float)
    reference_number = Column(String(100))  # PO number, invoice number, etc.
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    item = relationship("InventoryItem", back_populates="transactions")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_transaction_date', 'created_at'),
        Index('idx_transaction_type', 'transaction_type'),
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), nullable=False)  # create, update, delete, login, etc.
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer)
    old_values = Column(Text)  # JSON string of old values
    new_values = Column(Text)  # JSON string of new values
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_user', 'user_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_table', 'table_name'),
        Index('idx_audit_date', 'created_at'),
    )