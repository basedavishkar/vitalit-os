"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Doctor, DoctorCreate, DoctorUpdate } from '@/types/api';

interface DoctorFormProps {
  onDoctorAdded: (data: DoctorCreate | DoctorUpdate) => Promise<void>;
  onCancel?: () => void;
  doctor?: Doctor;
}

export default function DoctorForm({ onDoctorAdded, onCancel, doctor }: DoctorFormProps) {
  const [form, setForm] = useState({
    first_name: doctor?.first_name || "",
    last_name: doctor?.last_name || "",
    specialization: doctor?.specialization || "",
    qualification: doctor?.qualification || "",
    license_number: doctor?.license_number || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
    address: doctor?.address || "",
    consultation_fee: doctor?.consultation_fee || 0,
    is_active: doctor?.is_active ?? true
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.first_name.trim()) {
      alert('First Name is required');
      return;
    }
    
    if (!form.last_name.trim()) {
      alert('Last Name is required');
      return;
    }
    
    if (!form.specialization.trim()) {
      alert('Specialization is required');
      return;
    }
    
    if (!form.qualification.trim()) {
      alert('Qualification is required');
      return;
    }
    
    if (!form.license_number.trim()) {
      alert('License Number is required');
      return;
    }
    
    if (!form.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    
    if (!form.email.trim()) {
      alert('Email is required');
      return;
    }
    
    if (!form.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Phone validation - allow digits, spaces, hyphens, and plus sign
    const phoneDigits = form.phone.replace(/[+\-\s]/g, '');
    if (phoneDigits.length < 10) {
      alert('Phone number must be at least 10 digits');
      return;
    }
    
    if (form.consultation_fee < 0) {
      alert('Consultation fee cannot be negative');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert form data to match backend schema
      const submitData = {
        // Required fields
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        license_number: form.license_number.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        consultation_fee: parseFloat(form.consultation_fee.toString()),
        // Optional fields - only include if not empty
        ...(form.address?.trim() && { address: form.address.trim() }),
        is_active: Boolean(form.is_active)
      };
      
      await onDoctorAdded(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              placeholder="e.g. John"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              placeholder="e.g. Doe"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Specialization</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              placeholder="e.g. Cardiology"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Qualification</label>
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              required
              placeholder="e.g. MD"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">License Number</label>
          <input
            name="license_number"
            value={form.license_number}
            onChange={handleChange}
            required
            placeholder="e.g. MD123456"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. +1234567890"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="e.g. john@example.com"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="e.g. 123 Medical Center Dr"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Consultation Fee</label>
            <input
              name="consultation_fee"
              type="number"
              step="0.01"
              value={form.consultation_fee}
              onChange={handleChange}
              required
              placeholder="e.g. 150.00"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select
              name="is_active"
              value={form.is_active ? "true" : "false"}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : doctor ? 'Update Doctor' : 'Add Doctor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
