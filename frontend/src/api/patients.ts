import axios from 'axios';
import { Patient } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const createPatient = async (formData: Omit<Patient, 'id'>) => {
  const res = await axios.post(`${API_BASE}/patients/`, formData);
  return res.data;
};

export const getPatients = async () => {
  // Use development endpoint for now
  const res = await axios.get(`${API_BASE}/dev/patients`);
  return res.data;
};
