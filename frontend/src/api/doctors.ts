import axios from 'axios';
import { Doctor } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const createDoctor = async (formData: Omit<Doctor, 'id'>) => {
  const res = await axios.post(`${API_BASE}/doctors/`, formData);
  return res.data;
};

export const getDoctors = async () => {
  // Use development endpoint for now
  const res = await axios.get(`${API_BASE}/dev/doctors`);
  return res.data;
};
