import axios from "axios";
import { Bill } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const API_URL = `${API_BASE}/bills`;

export const createBill = async (data: Omit<Bill, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getBills = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getBillsByPatient = async (patientId: number) => {
  const res = await axios.get(`${API_URL}/${patientId}`);
  return res.data;
};

export const deleteBill = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 