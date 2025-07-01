import React, { useState } from "react";
import { addPatient } from "../lib/api";

export default function AddPatientForm() {
  const [form, setForm] = useState({ name: "", age: "", gender: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPatient(form);
      alert("Patient added successfully!");
      setForm({ name: "", age: "", gender: "" });
    } catch (err) {
      alert("Error adding patient.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
        placeholder="Age"
        className="w-full p-2 mb-2 border rounded"
      />
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add Patient
      </button>
    </form>
  );
}
