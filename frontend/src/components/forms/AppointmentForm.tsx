"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Patient, Doctor, Appointment, AppointmentCreate, AppointmentUpdate } from '@/types/api';

interface AppointmentFormProps {
  onAppointmentAdded: (data: AppointmentCreate | AppointmentUpdate) => Promise<void>;
  onCancel?: () => void;
  patients?: Patient[];
  doctors?: Doctor[];
  appointment?: Appointment;
}

export default function AppointmentForm({ onAppointmentAdded, onCancel, patients = [], doctors = [], appointment }: AppointmentFormProps) {
  const [form, setForm] = useState({
    patient_id: appointment?.patient_id || 0,
    doctor_id: appointment?.doctor_id || 0,
    scheduled_datetime: appointment?.scheduled_datetime ? new Date(appointment.scheduled_datetime).toISOString().slice(0, 16) : "",
    duration_minutes: appointment?.duration_minutes || 30,
    reason: appointment?.reason || "",
    status: appointment?.status || "scheduled" as const,
    notes: appointment?.notes || ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAppointmentAdded(form);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Patient</label>
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded"
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
              className="p-2 border border-gray-300 rounded"
            >
              <option value={0}>Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{`${d.first_name} ${d.last_name}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Date & Time</label>
            <input
              name="scheduled_datetime"
              type="datetime-local"
              value={form.scheduled_datetime}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded"
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
              min="15"
              max="480"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Reason</label>
          <input
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            placeholder="e.g. Annual checkup"
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional notes about the appointment"
            className="p-2 border border-gray-300 rounded h-20"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Saving...' : appointment ? 'Update Appointment' : 'Add Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
