import axios from "axios";
import { MedicalRecord } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const NEXT_PUBLIC_API_URL = `${API_BASE}/records`;

export const createRecord = async (data: Omit<MedicalRecord, 'id'>) => {
  const res = await axios.post(NEXT_PUBLIC_API_URL, data);
  return res.data;
};

export const getRecords = async () => {
  const res = await axios.get(NEXT_PUBLIC_API_URL);
  return res.data;
};

export const getRecordsByPatient = async (patientId: number) => {
  const res = await axios.get(`${NEXT_PUBLIC_API_URL}/${patientId}`);
  return res.data;
};

export const deleteRecord = async (id: number) => {
  const res = await axios.delete(`${NEXT_PUBLIC_API_URL}/${id}`);
  return res.data;
}; 