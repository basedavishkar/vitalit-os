import axios from "axios";
import { Doctor } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const NEXT_PUBLIC_API_URL = `${API_BASE}/doctors`;

/** POST /doctors */
export const createDoctor = async (formData: Omit<Doctor, 'id'>) => {
  const res = await axios.post(NEXT_PUBLIC_API_URL, formData);
  return res.data;
};


/** GET /doctors */
export const getDoctors = async () => {
  const res = await axios.get(NEXT_PUBLIC_API_URL);
  return res.data;
};
