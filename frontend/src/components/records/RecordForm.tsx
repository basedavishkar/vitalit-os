"use client";

import { useState } from "react";
import { createRecord } from "@/api/records";
import { Card } from "@/components/ui/card";
import { Patient, Doctor } from '@/types';

export default function RecordForm({ onRecordAdded, patients = [], doctors = [] }: { onRecordAdded?: () => void; patients?: Patient[]; doctors?: Doctor[] }) {
  const [form, setForm] = useState({
    patient_id: 0,
    doctor_id: 0,
    date: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <Card className="max-w-lg mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Patient</label>
          <select
            name="patient_id"
            value={form.patient_id}
            onChange={handleChange}
            required
          >
            <option value={0}>Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Doctor</label>
          <select
            name="doctor_id"
            value={form.doctor_id}
            onChange={handleChange}
            required
          >
            <option value={0}>Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Diagnosis</label>
          <input
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            required
            placeholder="e.g. Flu"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Prescription</label>
          <input
            name="prescription"
            value={form.prescription}
            onChange={handleChange}
            required
            placeholder="e.g. Paracetamol"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            required
            placeholder="e.g. Rest and hydrate"
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Medical Record
        </button>
      </form>
    </Card>
  );
} 