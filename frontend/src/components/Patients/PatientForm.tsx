"use client";

import { useState } from "react";
import { createPatient } from "@/api/patients"; // shared API logic

export default function PatientForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const payload = {
        ...formData,
        age: Number(formData.age), 
      };
  
      const res = await createPatient(payload);
      alert("Patient added successfully");
  
      setFormData({
        name: "",
        age: "",
        gender: "",
        address: "",
        contact: "",
      });
    } catch (err: any) {
      console.error("Patient creation failed:", err.response?.data || err.message);
      alert("Submission failed. See console for details.");
    }
  };
  
  
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto"
    >
      {["name", "age", "gender", "address", "contact"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "age" ? "number" : "text"}
          placeholder={field.replace("_", " ")}
          value={(formData as any)[field]}
          onChange={handleChange}
          className="block w-full px-4 py-2 border rounded"
          required
        />
      ))}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Add Patient
      </button>
    </form>
  );
}
