"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  contact_number: string;
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/patients")
      .then((res) => res.json())
      .then(setPatients);
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">Patients</h2>
      <ul className="divide-y">
        {patients.map((p) => (
          <li key={p.id} className="py-2">
            {p.name}, {p.age}, {p.gender}
          </li>
        ))}
      </ul>
    </div>
  );
}
