"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/api/patients";

export default function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getPatients();
      setPatients(data);
    })();
  }, []);

  return (
    <div className="mt-6 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">All Patients</h2>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Age</th>
            <th className="px-4 py-2 border">Gender</th>
            <th className="px-4 py-2 border">Address</th>
            <th className="px-4 py-2 border">Contact</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 border">{p.name}</td>
              <td className="px-4 py-2 border">{p.age}</td>
              <td className="px-4 py-2 border">{p.gender}</td>
              <td className="px-4 py-2 border">{p.address}</td>
              <td className="px-4 py-2 border">{p.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
