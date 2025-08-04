import { useState } from "react";
import { billingAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Patient, BillCreate } from '@/types/api';

export default function BillForm({ onBillAdded, patients }: { onBillAdded?: () => void; patients: Patient[] }) {
  const [form, setForm] = useState({
    patient_id: 0,
    appointment_id: undefined as number | undefined,
    bill_date: "",
    due_date: "",
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    notes: "",
    bill_items: [{
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]
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
        [name]: (name === 'patient_id' || name === 'subtotal' || name === 'tax_amount' || name === 'discount_amount' || name === 'total_amount') ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const billData: BillCreate = {
      ...form,
      patient_id: form.patient_id,
      bill_date: new Date(form.bill_date).toISOString(),
      due_date: new Date(form.due_date).toISOString(),
      bill_items: form.bill_items
    };
    await billingAPI.create(billData);
    setForm({
      patient_id: 0,
      appointment_id: undefined,
      bill_date: "",
      due_date: "",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      notes: "",
      bill_items: [{
        item_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0
      }]
    });
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
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Bill Date</label>
          <input name="bill_date" type="date" value={form.bill_date} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Due Date</label>
          <input name="due_date" type="date" value={form.due_date} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Subtotal</label>
          <input name="subtotal" type="number" value={form.subtotal} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Tax Amount</label>
          <input name="tax_amount" type="number" value={form.tax_amount} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Discount Amount</label>
          <input name="discount_amount" type="number" value={form.discount_amount} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Total Amount</label>
          <input name="total_amount" type="number" value={form.total_amount} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <input name="notes" value={form.notes} onChange={handleChange} />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Bill
        </button>
      </form>
    </Card>
  );
} 