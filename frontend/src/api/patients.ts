import axios from "axios";
import { Patient } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const API_URL = `${API_BASE}/patients`;

export const createPatient = async (formData: Omit<Patient, 'id'>) => {
  const res = await axios.post(API_URL, formData);
  return res.data;
};

export const getPatients = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
