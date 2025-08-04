export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
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
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  doctor_id: string
  first_name: string
  last_name: string
  specialization: string
  qualification: string
  license_number: string
  phone: string
  email: string
  address?: string
  consultation_fee: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  appointment_id: string
  patient_id: number
  doctor_id: number
  scheduled_datetime: string
  duration_minutes: number
  reason: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_by?: number
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Doctor
}

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

export interface Bill {
  id: number
  bill_id: string
  patient_id: number
  appointment_id?: number
  bill_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  payment_status: 'pending' | 'paid' | 'partial' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  bill_items?: BillItem[]
}

export interface BillItem {
  id: number
  bill_id: number
  item_name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
}

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

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  todayAppointments: number
  monthlyRevenue: number
  activePatients: number
  pendingAppointments: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
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