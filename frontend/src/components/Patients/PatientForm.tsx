"use client";

import { useState } from "react";
import { createPatient } from "@/api/patients";
import { Card } from "@/components/ui/card";

export default function PatientForm({ onPatientAdded }: { onPatientAdded?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    age: 0,
    gender: "",
    address: "",
    contact: "",
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
    setForm({ name: "", age: 0, gender: "", address: "", contact: "" });
    if (onPatientAdded) onPatientAdded();
  };

  return (
    <Card className="max-w-lg mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. John Doe"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Age</label>
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            required
            placeholder="e.g. 30"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Gender</label>
          <input
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            placeholder="e.g. Male"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="e.g. 123 Main St"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Contact</label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
            placeholder="e.g. 555-1234"
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Patient
        </button>
      </form>
    </Card>
  );
}
