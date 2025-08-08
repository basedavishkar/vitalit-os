"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Patient, PatientCreate, PatientUpdate } from '@/types/api';

interface PatientFormProps {
  onPatientAdded: (data: PatientCreate | PatientUpdate) => Promise<void>;
  onCancel?: () => void;
  patient?: Patient;
}

export default function PatientForm({ onPatientAdded, onCancel, patient }: PatientFormProps) {
  const [form, setForm] = useState({
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    date_of_birth: patient?.date_of_birth || "",
    gender: patient?.gender || "male" as "male" | "female" | "other",
    blood_group: patient?.blood_group || "",
    address: patient?.address || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    emergency_contact_name: patient?.emergency_contact_name || "",
    emergency_contact_phone: patient?.emergency_contact_phone || "",
    emergency_contact_relationship: patient?.emergency_contact_relationship || "",
    insurance_provider: patient?.insurance_provider || "",
    insurance_number: patient?.insurance_number || "",
    allergies: patient?.allergies || "",
    medical_history: patient?.medical_history || ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
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
    
    if (!form.date_of_birth) {
      alert('Date of Birth is required');
      return;
    }
    
    if (!form.address.trim()) {
      alert('Address is required');
      return;
    }
    
    if (!form.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    
    // Phone validation - allow digits, spaces, hyphens, and plus sign
    const phoneDigits = form.phone.replace(/[+\-\s]/g, '');
    if (phoneDigits.length < 10) {
      alert('Phone number must be at least 10 digits');
      return;
    }
    
    if (form.email && !form.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert form data to match backend schema
      const submitData = {
        // Required fields
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        date_of_birth: form.date_of_birth, // Keep as string, backend will parse
        gender: form.gender as "male" | "female" | "other",
        address: form.address.trim(),
        phone: form.phone.trim(),
        // Optional fields - only include if not empty
        ...(form.blood_group?.trim() && { blood_group: form.blood_group.trim() }),
        ...(form.email?.trim() && { email: form.email.trim() }),
        ...(form.emergency_contact_name?.trim() && { emergency_contact_name: form.emergency_contact_name.trim() }),
        ...(form.emergency_contact_phone?.trim() && { emergency_contact_phone: form.emergency_contact_phone.trim() }),
        ...(form.emergency_contact_relationship?.trim() && { emergency_contact_relationship: form.emergency_contact_relationship.trim() }),
        ...(form.insurance_provider?.trim() && { insurance_provider: form.insurance_provider.trim() }),
        ...(form.insurance_number?.trim() && { insurance_number: form.insurance_number.trim() }),
        ...(form.allergies?.trim() && { allergies: form.allergies.trim() }),
        ...(form.medical_history?.trim() && { medical_history: form.medical_history.trim() })
      };
      
      await onPatientAdded(submitData);
    } catch (error) {
      console.error('PatientForm submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="first_name" className="text-sm font-semibold text-gray-700">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              placeholder="e.g. John"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="last_name" className="text-sm font-semibold text-gray-700">Last Name</label>
            <input
              id="last_name"
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
            <label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-700">Date of Birth</label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="blood_group" className="text-sm font-semibold text-gray-700">Blood Group</label>
          <input
            id="blood_group"
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
            placeholder="e.g. A+"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="e.g. 123 Main St, City"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. +1234567890"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="emergency_contact_name" className="text-sm font-semibold text-gray-700">Emergency Contact Name</label>
            <input
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="emergency_contact_phone" className="text-sm font-semibold text-gray-700">Emergency Contact Phone</label>
            <input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              value={form.emergency_contact_phone}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="emergency_contact_relationship" className="text-sm font-semibold text-gray-700">Emergency Contact Relationship</label>
          <input
            id="emergency_contact_relationship"
            name="emergency_contact_relationship"
            value={form.emergency_contact_relationship}
            onChange={handleChange}
            placeholder="e.g. Spouse"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="insurance_provider" className="text-sm font-semibold text-gray-700">Insurance Provider</label>
            <input
              id="insurance_provider"
              name="insurance_provider"
              value={form.insurance_provider}
              onChange={handleChange}
              placeholder="e.g. Blue Cross"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="insurance_number" className="text-sm font-semibold text-gray-700">Insurance Number</label>
            <input
              id="insurance_number"
              name="insurance_number"
              value={form.insurance_number}
              onChange={handleChange}
              placeholder="e.g. 123456789"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="allergies" className="text-sm font-semibold text-gray-700">Allergies</label>
          <textarea
            id="allergies"
            name="allergies"
            value={form.allergies}
            onChange={handleChange}
            placeholder="e.g. Penicillin, Latex"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="medical_history" className="text-sm font-semibold text-gray-700">Medical History</label>
          <textarea
            id="medical_history"
            name="medical_history"
            value={form.medical_history}
            onChange={handleChange}
            placeholder="e.g. Previous surgeries, chronic conditions"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
          />
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
            {loading ? 'Saving...' : patient ? 'Update Patient' : 'Add Patient'}
          </Button>
        </div>
      </form>
    </div>
  );
}
