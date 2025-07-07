
import axios from "axios";
import { InventoryItem } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is not set');
const API_URL = `${API_BASE}/inventory`;

export const createInventoryItem = async (data: Omit<InventoryItem, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const deleteInventoryItem = async (id: number): Promise<{ detail: string }> => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
