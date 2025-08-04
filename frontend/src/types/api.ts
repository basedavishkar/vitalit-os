// Enums matching backend schemas
export type GenderEnum = 'male' | 'female' | 'other'

export type AppointmentStatusEnum = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export type PaymentStatusEnum = 'pending' | 'paid' | 'partial' | 'cancelled'

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff'

export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'check'

// Base types matching backend schemas
export interface PatientBase {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: GenderEnum
  blood_group?: string
  address: string
  phone: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  insurance_provider?: string
  insurance_number?: string
  allergies?: string
  medical_history?: string
}

export interface PatientCreate extends PatientBase {}

export interface PatientUpdate {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: GenderEnum
  blood_group?: string
  address?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  insurance_provider?: string
  insurance_number?: string
  allergies?: string
  medical_history?: string
}

export interface Patient extends PatientBase {
  id: number
  patient_id: string
  created_at: string
  updated_at?: string
}

export interface PatientDocumentBase {
  document_type: string
  description?: string
}

export interface PatientDocumentCreate extends PatientDocumentBase {}

export interface PatientDocument extends PatientDocumentBase {
  id: number
  patient_id: number
  filename: string
  original_filename: string
  file_path: string
  file_size?: number
  uploaded_by: number
  uploaded_at: string
}

export interface EmergencyContactUpdate {
  name?: string
  phone?: string
  relationship?: string
}

export interface DoctorBase {
  first_name: string
  last_name: string
  specialization: string
  qualification: string
  license_number: string
  phone: string
  email: string
  address?: string
  consultation_fee: number
}

export interface DoctorCreate extends DoctorBase {}

export interface DoctorUpdate {
  first_name?: string
  last_name?: string
  specialization?: string
  qualification?: string
  license_number?: string
  phone?: string
  email?: string
  address?: string
  consultation_fee?: number
  is_active?: boolean
}

export interface Doctor extends DoctorBase {
  id: number
  doctor_id: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface AppointmentBase {
  patient_id: number
  doctor_id: number
  scheduled_datetime: string
  duration_minutes: number
  reason: string
  notes?: string
}

export interface AppointmentCreate extends AppointmentBase {}

export interface AppointmentUpdate {
  patient_id?: number
  doctor_id?: number
  scheduled_datetime?: string
  duration_minutes?: number
  reason?: string
  status?: AppointmentStatusEnum
  notes?: string
}

export interface Appointment extends AppointmentBase {
  id: number
  appointment_id: string
  status: AppointmentStatusEnum
  created_by?: number
  created_at: string
  updated_at?: string
}

export interface SmartAppointmentRequest {
  patient_id: number
  doctor_id: number
  preferred_date: string
  preferred_time?: string
  duration_minutes: number
  reason: string
  notes?: string
  appointment_id?: string
}

export interface BillItemBase {
  item_name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface BillItemCreate extends BillItemBase {}

export interface BillItem extends BillItemBase {
  id: number
  bill_id: number
}

export interface BillBase {
  patient_id: number
  appointment_id?: number
  bill_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  notes?: string
}

export interface BillCreate extends BillBase {
  bill_items: BillItemCreate[]
}

export interface BillUpdate {
  patient_id?: number
  appointment_id?: number
  bill_date?: string
  due_date?: string
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  total_amount?: number
  notes?: string
}

export interface Bill extends BillBase {
  id: number
  bill_id: string
  paid_amount: number
  payment_status: PaymentStatusEnum
  created_at: string
  updated_at?: string
  bill_items: BillItem[]
}

export interface PaymentBase {
  bill_id: number
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  reference_number?: string
  notes?: string
}

export interface PaymentCreate extends PaymentBase {}

export interface Payment extends PaymentBase {
  id: number
  payment_id: string
  created_at: string
}

export interface InsuranceClaimRequest {
  bill_id: number
  insurance_provider: string
  insurance_number: string
}

export interface PaymentIntentRequest {
  bill_id: number
  amount: number
  currency: string
}

export interface PaymentProcessRequest {
  bill_id: number
  payment_method: PaymentMethod
  amount: number
  payment_intent_id?: string
}

export interface AutomatedBillRequest {
  appointment_id: number
  bill_items: Record<string, any>[]
}

export interface BillCalculationRequest {
  appointment_id: number
  additional_services?: Record<string, any>[]
}

export interface UserBase {
  username: string
  email: string
  role: UserRole
}

export interface UserCreate extends UserBase {
  password: string
}

export interface UserUpdate {
  username?: string
  email?: string
  role?: UserRole
  is_active?: boolean
}

export interface User extends UserBase {
  id: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface TokenData {
  username?: string
  user_id?: number
  role?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
  requires_mfa: boolean
}

export interface MFASetupRequest {
  enable: boolean
}

export interface MFASetupResponse {
  secret: string
  qr_code: string
  backup_codes: string[]
}

export interface MFAVerifyRequest {
  token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  new_password: string
}

export interface UserSession {
  id: number
  session_token: string
  ip_address?: string
  user_agent?: string
  created_at: string
  expires_at: string
  is_active: boolean
}

export interface UserSecurityInfo {
  mfa_enabled: boolean
  last_login?: string
  failed_login_attempts: number
  locked_until?: string
  password_changed_at: string
  active_sessions_count: number
}

// Common response types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface SuccessResponse {
  message: string
  data?: Record<string, any>
}

export interface ErrorResponse {
  error: string
  detail?: string
}

// Legacy types for backward compatibility
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface SearchParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PatientSearchParams extends SearchParams {
  gender?: string
  minAge?: number
  maxAge?: number
  bloodGroup?: string
  insuranceProvider?: string
  hasAllergies?: boolean
}

// Medical Record types (if they exist in backend)
export interface MedicalRecord {
  id: number
  record_id: string
  patient_id: number
  doctor_id: number
  appointment_id?: number
  visit_date: string
  chief_complaint: string
  diagnosis: string
  treatment_plan?: string
  prescription_notes?: string
  follow_up_date?: string
  created_by: number
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Doctor
}

// Inventory types (if they exist in backend)
export interface InventoryItem {
  id: number
  item_id: string
  name: string
  description?: string
  category: string
  unit: string
  current_quantity: number
  minimum_quantity: number
  maximum_quantity?: number
  unit_price: number
  supplier?: string
  expiry_date?: string
  location?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  todayAppointments: number
  monthlyRevenue: number
  activePatients: number
  pendingAppointments: number
} 