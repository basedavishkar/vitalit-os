import axios from "axios";
import { Appointment } from '@/types';

const API_BASE = process.env.API_URL;
if (!API_BASE) throw new Error('API_URL is not set');
const API_URL = `${API_BASE}/appointments`;

export const createAppointment = async (data: Omit<Appointment, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getAppointments = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
