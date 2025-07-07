"use client";

import { useState } from "react";
import { createRecord } from "@/api/records";
import Card from "@/components/ui/Card";

export default function RecordForm({ onRecordAdded }: { onRecordAdded?: () => void }) {
  const [form, setForm] = useState({
    patient_id: 0,
    doctor_id: 0,
    date: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: (name === 'patient_id' || name === 'doctor_id') ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRecord(form);
    setForm({ patient_id: 0, doctor_id: 0, date: "", diagnosis: "", prescription: "", notes: "" });
    if (onRecordAdded) onRecordAdded();
  };

  return (
    <Card className="max-w-lg mx-auto mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-center tracking-tight">Add Medical Record</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Patient ID</label>
          <input name="patient_id" type="number" value={form.patient_id} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Doctor ID</label>
          <input name="doctor_id" type="number" value={form.doctor_id} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Diagnosis</label>
          <input name="diagnosis" value={form.diagnosis} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Prescription</label>
          <input name="prescription" value={form.prescription} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <input name="notes" value={form.notes} onChange={handleChange} required />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Medical Record
        </button>
      </form>
    </Card>
  );
} 