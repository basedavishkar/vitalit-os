import { useState } from "react";
import axios from "axios";

function DoctorForm() {
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/doctors", form);
      alert("Doctor registered");
      setForm({
        name: "",
        specialization: "",
        phone: "",
        email: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to register doctor");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register Doctor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          placeholder="Specialization"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default DoctorForm;
