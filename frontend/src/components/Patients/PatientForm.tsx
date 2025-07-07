"use client";

import { useState } from "react";
import { createPatient } from "@/api/patients";
import Card from "@/components/ui/Card";

export default function PatientForm({ onPatientAdded }: { onPatientAdded?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    age: 0,
    gender: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'age' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPatient(form);
    setForm({ name: "", age: 0, gender: "", phone: "", email: "" });
    if (onPatientAdded) onPatientAdded();
  };

  return (
    <Card className="max-w-lg mx-auto mb-8">
      <h2 className="text-2xl font-extrabold text-emerald-700 mb-6 text-center tracking-tight">Add Patient</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Gender</label>
          <input name="gender" value={form.gender} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Email</label>
          <input name="email" value={form.email} onChange={handleChange} required />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Patient
        </button>
      </form>
    </Card>
  );
}
