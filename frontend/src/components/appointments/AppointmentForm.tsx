"use client";

import { useState } from "react";
import { createAppointment } from "@/api/appointments";
import Card from "@/components/ui/Card";

export default function AppointmentForm({ onAppointmentAdded }: { onAppointmentAdded?: () => void }) {
  const [form, setForm] = useState({
    patient_id: 0,
    doctor_id: 0,
    datetime: "",
    reason: "",
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
    await createAppointment(form);
    setForm({ patient_id: 0, doctor_id: 0, datetime: "", reason: "" });
    if (onAppointmentAdded) onAppointmentAdded();
  };

  return (
    <Card className="max-w-lg mx-auto mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-center tracking-tight">Add Appointment</h2>
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
          <label className="font-bold text-emerald-700 text-lg">Date & Time</label>
          <input name="datetime" type="datetime-local" value={form.datetime} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Reason</label>
          <input name="reason" value={form.reason} onChange={handleChange} required />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Appointment
        </button>
      </form>
    </Card>
  );
}
