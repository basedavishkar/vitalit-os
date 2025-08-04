"use client";

import { useState } from "react";
import { recordsAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Patient, Doctor } from '@/types/api';

export default function RecordForm({ onRecordAdded, patients = [], doctors = [], currentUserId = 1 }: { onRecordAdded?: () => void; patients?: Patient[]; doctors?: Doctor[]; currentUserId?: number }) {
  const [form, setForm] = useState({
    patient_id: 0,
    doctor_id: 0,
    visit_date: "",
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    prescription_notes: "",
    notes: "",
    created_by: currentUserId
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: (name === 'patient_id' || name === 'doctor_id' || name === 'created_by') ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordsAPI.create(form);
    setForm({ patient_id: 0, doctor_id: 0, visit_date: "", chief_complaint: "", diagnosis: "", treatment_plan: "", prescription_notes: "", notes: "", created_by: currentUserId });
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
              <option key={p.id} value={p.id}>{`${p.first_name} ${p.last_name}`}</option>
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
              <option key={d.id} value={d.id}>{`${d.first_name} ${d.last_name}`}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Visit Date</label>
          <input
            name="visit_date"
            type="date"
            value={form.visit_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Chief Complaint</label>
          <input
            name="chief_complaint"
            value={form.chief_complaint}
            onChange={handleChange}
            required
            placeholder="e.g. Headache"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Diagnosis</label>
          <input
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            required
            placeholder="e.g. Migraine"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Treatment Plan</label>
          <input
            name="treatment_plan"
            value={form.treatment_plan}
            onChange={handleChange}
            placeholder="e.g. Rest, hydration, medication"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Prescription Notes</label>
          <input
            name="prescription_notes"
            value={form.prescription_notes}
            onChange={handleChange}
            placeholder="e.g. Paracetamol 500mg"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="e.g. Follow up in 2 weeks"
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Medical Record
        </button>
      </form>
    </Card>
  );
} 