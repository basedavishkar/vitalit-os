"use client";

import { useEffect, useState } from "react";
import { getDoctors } from "@/api/doctors";

export default function DoctorList() {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getDoctors();
      setDoctors(data);
    })();
  }, []);

  return (
    <div className="mt-6 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">All Doctors</h2>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Specialization</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Email</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-2 border">{d.name}</td>
              <td className="px-4 py-2 border">{d.specialization}</td>
              <td className="px-4 py-2 border">{d.phone}</td>
              <td className="px-4 py-2 border">{d.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
