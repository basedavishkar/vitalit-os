
import axios from "axios";

const API_BASE = "http://localhost:8000/inventory"; 
; 

export interface InventoryCreate {
  name: string;
  quantity: number;
  price: number;
  expiry_date: string; 
  vendor: string;
}

export interface InventoryItem extends InventoryCreate {
  id: number;
}

// Get all inventory items
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const res = await axios.get(API_BASE);
  return res.data;
}

// Get a single item by ID
export async function getInventoryItem(id: number): Promise<InventoryItem> {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
}

// Create a new inventory item
export async function createInventoryItem(item: InventoryCreate): Promise<InventoryItem> {
  const res = await axios.post(API_BASE, item);
  return res.data;
}

// Update an item
export async function updateInventoryItem(id: number, item: InventoryCreate): Promise<InventoryItem> {
  const res = await axios.put(`${API_BASE}/${id}`, item);
  return res.data;
}

// Delete an item
export async function deleteInventoryItem(id: number): Promise<{ detail: string }> {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
}
