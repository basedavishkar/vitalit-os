import axios from "axios";
import { Appointment } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const NEXT_PUBLIC_API_URL = `${API_BASE}/appointments`;

export const createAppointment = async (data: Omit<Appointment, 'id'>) => {
  const res = await axios.post(NEXT_PUBLIC_API_URL, data);
  return res.data;
};

export const getAppointments = async () => {
  const res = await axios.get(NEXT_PUBLIC_API_URL);
  return res.data;
};
