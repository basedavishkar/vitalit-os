"use client";

import { useState } from "react";
import { createInventoryItem } from "@/api/inventory";

export default function InventoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    expiry_date: "",
    vendor: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        expiry_date: new Date(formData.expiry_date).toISOString(),
      };

      await createInventoryItem(payload);
      alert("Inventory item added successfully");

      setFormData({
        name: "",
        quantity: "",
        price: "",
        expiry_date: "",
        vendor: "",
      });
    } catch (err: any) {
      console.error("Inventory creation failed:", err.response?.data || err.message);
      alert("Failed to add inventory item. See console for details.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-center">Add Inventory Item</h2>
      {["name", "quantity", "price", "vendor"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "quantity" || field === "price" ? "number" : "text"}
          placeholder={field.replace("_", " ")}
          value={(formData as any)[field]}
          onChange={handleChange}
          className="block w-full px-4 py-2 border rounded"
          required
        />
      ))}
      <input
        name="expiry_date"
        type="date"
        value={formData.expiry_date}
        onChange={handleChange}
        className="block w-full px-4 py-2 border rounded"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Add Item
      </button>
    </form>
  );
}
