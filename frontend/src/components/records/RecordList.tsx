"use client";

import { useEffect, useState } from "react";
import { getRecords, deleteRecord } from "@/api/records";
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";

export default function RecordList() {
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setRecords(await getRecords());
      setPatients(await getPatients());
      setDoctors(await getDoctors());
    })();
  }, []);

  const nameById = (arr: any[], id: number, field = "name") =>
    arr.find((x) => x.id === id)?.[field] || id;

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    await deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Group records by patient
  const grouped = records.reduce((acc: any, rec: any) => {
    (acc[rec.patient_id] = acc[rec.patient_id] || []).push(rec);
    return acc;
  }, {});

  return (
    <div className="mt-6 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
      {Object.keys(grouped).length === 0 ? (
        <div>No records found.</div>
      ) : (
        Object.entries(grouped).map(([pid, recs]: any) => (
          <div key={pid} className="mb-8">
            <h3 className="font-bold mb-2">
              Patient: {nameById(patients, Number(pid))}
            </h3>
            <table className="w-full text-left border mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Doctor</th>
                  <th className="px-4 py-2 border">Diagnosis</th>
                  <th className="px-4 py-2 border">Treatment</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 border">{nameById(doctors, r.doctor_id)}</td>
                    <td className="px-4 py-2 border">{r.diagnosis}</td>
                    <td className="px-4 py-2 border">{r.treatment}</td>
                    <td className="px-4 py-2 border">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">
                      <button onClick={() => handleDelete(r.id)} className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
} 