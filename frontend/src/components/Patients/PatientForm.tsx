"use client";

import { useState } from "react";

export default function PatientForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact_number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:8000/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({
      name: "",
      age: "",
      gender: "",
      address: "",
      contact_number: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      {["name", "age", "gender", "address", "contact_number"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field.replace("_", " ")}
          value={(formData as any)[field]}
          onChange={handleChange}
          className="block w-full px-4 py-2 border rounded"
        />
      ))}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Add Patient
      </button>
    </form>
  );
}
