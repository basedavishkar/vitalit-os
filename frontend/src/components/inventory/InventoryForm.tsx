import { Card } from "@/components/ui/card";
import { useState } from "react";
import { inventoryAPI } from "@/lib/api";
import { InventoryItem } from '@/types/api';

export default function InventoryForm({ onItemAdded }: { onItemAdded?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    current_quantity: 0,
    minimum_quantity: 0,
    unit_price: 0,
    supplier: "",
    location: "",
    is_active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inventoryAPI.create(form);
    setForm({
      name: "",
      description: "",
      category: "",
      unit: "",
      current_quantity: 0,
      minimum_quantity: 0,
      unit_price: 0,
      supplier: "",
      location: "",
      is_active: true
    });
    if (onItemAdded) onItemAdded();
  };

  return (
    <Card className="max-w-lg mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Name</label>
          <input
            name="name"
            type="text"
            placeholder="e.g. Paracetamol"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Description</label>
          <input
            name="description"
            type="text"
            placeholder="e.g. Pain relief medication"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Category</label>
          <input
            name="category"
            type="text"
            placeholder="e.g. Medicine"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Unit</label>
          <input
            name="unit"
            type="text"
            placeholder="e.g. tablets"
            value={form.unit}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Current Quantity</label>
          <input
            name="current_quantity"
            type="number"
            placeholder="e.g. 100"
            value={form.current_quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Minimum Quantity</label>
          <input
            name="minimum_quantity"
            type="number"
            placeholder="e.g. 10"
            value={form.minimum_quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Unit Price</label>
          <input
            name="unit_price"
            type="number"
            step="0.01"
            placeholder="e.g. 49.99"
            value={form.unit_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Supplier</label>
          <input
            name="supplier"
            type="text"
            placeholder="e.g. Medico Supplies"
            value={form.supplier}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Location</label>
          <input
            name="location"
            type="text"
            placeholder="e.g. Storage Room A"
            value={form.location}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Item
        </button>
      </form>
    </Card>
  );
} 