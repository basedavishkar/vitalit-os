export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  contact: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  datetime: string;
  reason: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface Bill {
  id: number;
  patient_id: number;
  date: string;
  amount: number;
  description: string;
  paid: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiry_date: string;
  vendor: string;
} 