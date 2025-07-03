"use client";

import { useState } from "react";
import { createDoctor } from "@/api/doctors";

export default function DoctorForm() {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await createDoctor(formData);      // send plain JSON
      alert("Doctor added successfully");
      setFormData({ name: "", specialization: "", phone: "", email: "" });
    } catch (err: any) {
      console.error(err);
      alert("Failed to add doctor");
    }
  };
  

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto"
    >
      {["name", "specialization", "phone", "email"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "email" ? "email" : "text"}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={(formData as any)[field]}
          onChange={handleChange}
          className="block w-full px-4 py-2 border rounded"
          required
        />
      ))}

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Add Doctor
      </button>
    </form>
  );
}
