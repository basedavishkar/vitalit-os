"use client";

import { useEffect, useState } from "react";
import { createRecord } from "@/api/records";
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";

export default function RecordForm({ onRecordAdded }: { onRecordAdded?: () => void }) {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    date: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setPatients(await getPatients());
      setDoctors(await getDoctors());
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecord({
        ...formData,
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
      });
      setFormData({ patient_id: "", doctor_id: "", date: "", diagnosis: "", prescription: "", notes: "" });
      if (onRecordAdded) onRecordAdded();
      alert("Medical record added");
    } catch (err) {
      alert("Failed to add record");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto">
      <select name="patient_id" value={formData.patient_id} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required>
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required>
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>{d.name} – {d.specialization}</option>
        ))}
      </select>
      <input name="date" type="date" value={formData.date} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <textarea name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <textarea name="prescription" placeholder="Prescription" value={formData.prescription} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} className="block w-full px-4 py-2 border rounded" required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Add Record</button>
    </form>
  );
} 