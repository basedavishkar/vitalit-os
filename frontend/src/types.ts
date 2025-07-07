export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  reason: string;
}

export interface Record {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  treatment: string;
  date: string;
}

export interface Bill {
  id: number;
  patient_id: number;
  amount: number;
  date: string;
  description: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiry_date: string;
  vendor: string;
} 