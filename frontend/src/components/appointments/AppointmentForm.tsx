"use client";

import { useEffect, useState } from "react";
import { createAppointment } from "@/api/appointments";
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    datetime: "",
    reason: "",
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setPatients(await getPatients());
      setDoctors(await getDoctors());
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment(formData);
      alert("Appointment created");
      setFormData({ patient_id: "", doctor_id: "", datetime: "", reason: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create appointment");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto"
    >
      <select
        name="patient_id"
        value={formData.patient_id}
        onChange={handleChange}
        className="block w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        name="doctor_id"
        value={formData.doctor_id}
        onChange={handleChange}
        className="block w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} – {d.specialization}
          </option>
        ))}
      </select>

      <input
        name="datetime"
        type="datetime-local"
        value={formData.datetime}
        onChange={handleChange}
        className="block w-full px-4 py-2 border rounded"
        required
      />

      <input
        name="reason"
        type="text"
        placeholder="Reason"
        value={formData.reason}
        onChange={handleChange}
        className="block w-full px-4 py-2 border rounded"
        required
      />

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Add Appointment
      </button>
    </form>
  );
}
