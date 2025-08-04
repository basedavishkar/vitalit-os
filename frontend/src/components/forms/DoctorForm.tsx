"use client";

import { useState } from "react";
import { doctorsAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";

export default function DoctorForm({ onDoctorAdded }: { onDoctorAdded?: () => void }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    specialization: "",
    qualification: "",
    license_number: "",
    phone: "",
    email: "",
    address: "",
    consultation_fee: 0,
    is_active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doctorsAPI.create(form);
    setForm({ 
      first_name: "", 
      last_name: "", 
      specialization: "", 
      qualification: "",
      license_number: "",
      phone: "", 
      email: "",
      address: "",
      consultation_fee: 0,
      is_active: true
    });
    if (onDoctorAdded) onDoctorAdded();
  };

  return (
    <Card className="max-w-lg mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            placeholder="e.g. John"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            placeholder="e.g. Doe"
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
          <label className="font-bold text-emerald-700 text-lg">Qualification</label>
          <input
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            required
            placeholder="e.g. MD"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">License Number</label>
          <input
            name="license_number"
            value={form.license_number}
            onChange={handleChange}
            required
            placeholder="e.g. MD123456"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="e.g. 555-1234"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="e.g. john.doe@hospital.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g. 123 Medical Center Dr"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Consultation Fee</label>
          <input
            name="consultation_fee"
            type="number"
            step="0.01"
            value={form.consultation_fee}
            onChange={handleChange}
            required
            placeholder="e.g. 150.00"
          />
        </div>
        <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 text-lg">
          <span>➕</span> Add Doctor
        </button>
      </form>
    </Card>
  );
}
