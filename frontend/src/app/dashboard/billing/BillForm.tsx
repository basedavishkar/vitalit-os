import { useState } from "react";
import { billingAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Patient, BillCreate } from '@/types/api';

export default function BillForm({ onBillAdded, patients }: { onBillAdded?: () => void; patients: Patient[] }) {
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    amount: 0,
    description: "",
    dueDate: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'amount' ? Number(value) : value,
    });
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setForm({
      ...form,
      patientId,
      patientName: patient ? patient.name : ""
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const billData: BillCreate = {
      patientId: form.patientId,
      patientName: form.patientName,
      amount: form.amount,
      description: form.description,
      dueDate: new Date(form.dueDate)
    };
    await billingAPI.create(billData);
    setForm({
      patientId: "",
      patientName: "",
      amount: 0,
      description: "",
      dueDate: ""
    });
    if (onBillAdded) onBillAdded();
  };

  return (
    <Card className="max-w-lg mx-auto mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-center tracking-tight">Add Bill</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Patient</label>
          <select name="patientId" value={form.patientId} onChange={handlePatientChange} required>
            <option value="">Select Patient</option>
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
          <label className="font-bold text-emerald-700 text-lg">Description</label>
          <input name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Due Date</label>
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Bill
        </button>
      </form>
    </Card>
  );
} 