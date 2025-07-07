"use client";

import { useEffect, useState } from "react";
import { createBill } from "@/api/bills";
import { getPatients } from "@/api/patients";

export default function BillForm({ onBillAdded }: { onBillAdded?: () => void }) {
  const [formData, setFormData] = useState({
    patient_id: "",
    amount: "",
    description: "",
    date: "",
  });
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setPatients(await getPatients());
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBill({
        ...formData,
        patient_id: Number(formData.patient_id),
        amount: Number(formData.amount),
      });
      setFormData({ patient_id: "", amount: "", description: "", date: "" });
      if (onBillAdded) onBillAdded();
      alert("Bill generated");
    } catch (err) {
      alert("Failed to add bill");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto">
      <select name="patient_id" value={formData.patient_id} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required>
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input name="amount" type="number" placeholder="Amount" value={formData.amount} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <input name="description" type="text" placeholder="Description" value={formData.description} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <input name="date" type="date" value={formData.date} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Add Bill</button>
    </form>
  );
} 