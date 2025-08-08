// API Types for VITALIt Healthcare System

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  monthlyRevenue: number;
  activePatients: number;
  pendingAppointments: number;
  totalRevenue: number;
  averageAge: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  lastVisit: Date;
  status: 'active' | 'inactive' | 'pending';
  doctor: string;
  nextAppointment?: Date;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  medications: string[];
  insurance: string;
  insuranceNumber: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  experience: number;
  education: string;
  license: string;
  schedule: string;
  patients: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'consultation' | 'examination' | 'surgery' | 'follow_up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  duration: number;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  date: Date;
  dueDate: Date;
  description: string;
  insuranceCoverage: number;
  patientResponsibility: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface SystemStatus {
  database: string;
  apiServer: string;
  storage: string;
  backup: string;
  responseTime: string;
  uptime: string;
  activeSessions: number;
  dataSync: string;
}

export interface RealTimeData {
  notifications: Notification[];
  systemStatus: SystemStatus;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface AnalyticsData {
  patientGrowth: ChartData[];
  revenueTrends: ChartData[];
  departmentDistribution: ChartData[];
  genderDistribution: ChartData[];
  ageGroupDistribution: ChartData[];
}

// Form Types
export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  medications: string[];
  insurance: string;
  insuranceNumber: string;
  doctor: string;
}

export interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  experience: number;
  education: string;
  license: string;
  schedule: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  type: 'consultation' | 'examination' | 'surgery' | 'follow_up' | 'emergency';
  notes: string;
  duration: number;
}

export interface BillFormData {
  patientId: string;
  amount: number;
  description: string;
  insuranceCoverage: number;
  dueDate: Date;
}

export interface BillCreate {
  patientId: string;
  patientName: string;
  amount: number;
  description: string;
  dueDate: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

// Filter Types
export interface PatientFilters {
  status?: string;
  doctor?: string;
  ageRange?: [number, number];
  gender?: string;
  bloodType?: string;
}

export interface AppointmentFilters {
  status?: string;
  doctor?: string;
  patient?: string;
  dateRange?: [Date, Date];
  type?: string;
}

export interface BillFilters {
  status?: string;
  patient?: string;
  dateRange?: [Date, Date];
  amountRange?: [number, number];
}

// Search Types
export interface SearchResult {
  type: 'patient' | 'doctor' | 'appointment' | 'bill';
  id: string;
  title: string;
  subtitle: string;
  data: any;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Real-time Types
export interface RealTimeUpdate {
  type: 'patient' | 'appointment' | 'bill' | 'notification';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stats' | 'table' | 'list';
  title: string;
  data: any;
  config?: any;
}

export interface AppointmentCreate {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'consultation' | 'examination' | 'surgery' | 'follow_up' | 'emergency';
  notes: string;
  duration: number;
}

export interface AppointmentUpdate {
  id: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  date?: Date;
  time?: string;
  type?: 'consultation' | 'examination' | 'surgery' | 'follow_up' | 'emergency';
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  duration?: number;
}

export interface BillUpdate {
  id: string;
  patientId?: string;
  patientName?: string;
  amount?: number;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  date?: Date;
  dueDate?: Date;
  description?: string;
  insuranceCoverage?: number;
  patientResponsibility?: number;
} 