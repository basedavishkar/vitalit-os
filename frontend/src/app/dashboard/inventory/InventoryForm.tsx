"use client";

import { useState } from "react";
import { createInventoryItem } from "@/api/inventory";
import { InventoryItem } from '@/types';

export default function InventoryForm({ onItemAdded }: { onItemAdded?: () => void }) {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: "",
    quantity: 0,
    price: 0,
    expiry_date: "",
    vendor: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createInventoryItem(formData);
    setFormData({ name: "", quantity: 0, price: 0, expiry_date: "", vendor: "" });
    if (onItemAdded) onItemAdded();
    alert("Inventory item added");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-bold text-emerald-700 text-lg">Name</label>
        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="quantity" className="font-bold text-emerald-700 text-lg">Quantity</label>
        <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="price" className="font-bold text-emerald-700 text-lg">Price</label>
        <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="expiry_date" className="font-bold text-emerald-700 text-lg">Expiry Date</label>
        <input id="expiry_date" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="vendor" className="font-bold text-emerald-700 text-lg">Vendor</label>
        <input id="vendor" name="vendor" type="text" value={formData.vendor} onChange={handleChange} required />
      </div>
      <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
        <span>➕</span> Add Item
      </button>
    </form>
  );
}
