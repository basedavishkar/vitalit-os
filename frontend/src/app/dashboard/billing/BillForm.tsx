import { useState } from "react";
import { createBill } from "@/api/bills";
import { Card } from "@/components/ui/card";
import { Patient } from '@/types';

export default function BillForm({ onBillAdded, patients }: { onBillAdded?: () => void; patients: Patient[] }) {
  const [form, setForm] = useState({
    patient_id: 0,
    amount: 0,
    date: "",
    description: "",
    paid: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm({
        ...form,
        [name]: e.target.checked,
      });
    } else {
      setForm({
        ...form,
        [name]: (name === 'patient_id' || name === 'amount') ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createBill(form);
    setForm({ patient_id: 0, amount: 0, date: "", description: "", paid: false });
    if (onBillAdded) onBillAdded();
  };

  return (
    <Card className="max-w-lg mx-auto mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-center tracking-tight">Add Bill</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Patient</label>
          <select name="patient_id" value={form.patient_id} onChange={handleChange} required>
            <option value={0}>Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Amount</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Description</label>
          <input name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Paid</label>
          <input name="paid" type="checkbox" checked={form.paid} onChange={handleChange} />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Bill
        </button>
      </form>
    </Card>
  );
} 