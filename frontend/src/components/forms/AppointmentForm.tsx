"use client";

import { useState } from "react";
import { appointmentsAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Patient, Doctor } from '@/types/api';

export default function AppointmentForm({ onAppointmentAdded, patients = [], doctors = [] }: { onAppointmentAdded?: () => void; patients?: Patient[]; doctors?: Doctor[] }) {
  const [form, setForm] = useState({
    patient_id: 0,
    doctor_id: 0,
    scheduled_datetime: "",
    duration_minutes: 30,
    reason: "",
    status: "scheduled" as const,
    notes: ""
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
    // Create appointment data with required fields
    const appointmentData = {
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      scheduled_datetime: form.scheduled_datetime,
      duration_minutes: form.duration_minutes,
      reason: form.reason,
      status: form.status,
      notes: form.notes
    };
    await appointmentsAPI.create(appointmentData);
    setForm({ 
      patient_id: 0, 
      doctor_id: 0, 
      scheduled_datetime: "", 
      duration_minutes: 30,
      reason: "", 
      status: "scheduled" as const,
      notes: ""
    });
    if (onAppointmentAdded) onAppointmentAdded();
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
          <label className="font-bold text-emerald-700 text-lg">Date & Time</label>
          <input
            name="scheduled_datetime"
            type="datetime-local"
            value={form.scheduled_datetime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Duration (minutes)</label>
          <input
            name="duration_minutes"
            type="number"
            value={form.duration_minutes}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Reason</label>
          <input
            name="reason"
            type="text"
            value={form.reason}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <input
            name="notes"
            type="text"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Appointment
        </button>
      </form>
    </Card>
  );
}
