"use client";

import { useState } from "react";
import { createDoctor } from "@/api/doctors";
import Card from "@/components/ui/Card";

export default function DoctorForm({ onDoctorAdded }: { onDoctorAdded?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDoctor(form);
    setForm({ name: "", specialization: "", phone: "", email: "" });
    if (onDoctorAdded) onDoctorAdded();
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
            placeholder="e.g. Dr. Smith"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Specialization</label>
          <input
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            placeholder="e.g. Cardiology"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="e.g. 555-6789"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="e.g. dr.smith@email.com"
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Doctor
        </button>
      </form>
    </Card>
  );
}
