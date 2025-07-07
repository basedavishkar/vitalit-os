import axios from "axios";
import { Bill } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const NEXT_PUBLIC_API_URL = `${API_BASE}/bills`;

export const createBill = async (data: Omit<Bill, 'id'>) => {
  const res = await axios.post(NEXT_PUBLIC_API_URL, data);
  return res.data;
};

export const getBills = async () => {
  const res = await axios.get(NEXT_PUBLIC_API_URL);
  return res.data;
}; 