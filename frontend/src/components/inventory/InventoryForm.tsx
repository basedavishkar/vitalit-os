import { Card } from "@/components/ui/Card";
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInventoryItem({
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
    });
    setFormData({ name: "", quantity: 0, price: 0, expiry_date: "", vendor: "" });
    if (onItemAdded) onItemAdded();
    alert("Inventory item added");
  };

  return (
    <Card className="max-w-lg mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-left tracking-tight">
        Add Inventory Item
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-bold text-emerald-700 text-lg">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Paracetamol"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="quantity" className="font-bold text-emerald-700 text-lg">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            placeholder="e.g. 100"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="font-bold text-emerald-700 text-lg">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            placeholder="e.g. 49.99"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="expiry_date" className="font-bold text-emerald-700 text-lg">Expiry Date</label>
          <input
            id="expiry_date"
            name="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="vendor" className="font-bold text-emerald-700 text-lg">Vendor</label>
          <input
            id="vendor"
            name="vendor"
            type="text"
            placeholder="e.g. Medico Supplies"
            value={formData.vendor}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Item
        </button>
      </form>
    </Card>
  );
} 