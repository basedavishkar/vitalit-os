
import axios from "axios";
import { InventoryItem } from '@/types';

const API_URL = "http://localhost:8000/inventory";

export const createInventoryItem = async (data: Omit<InventoryItem, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
