import axios from "axios";
import { Record } from '@/types';

const API_BASE = process.env.API_URL;
if (!API_BASE) throw new Error('API_URL is not set');
const API_URL = `${API_BASE}/records`;

export const createRecord = async (data: Omit<Record, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getRecords = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getRecordsByPatient = async (patientId: number) => {
  const res = await axios.get(`${API_URL}/${patientId}`);
  return res.data;
};

export const deleteRecord = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 