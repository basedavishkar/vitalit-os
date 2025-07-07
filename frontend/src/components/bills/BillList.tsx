"use client";

import { useEffect, useState } from "react";
import { getBills, deleteBill } from "@/api/bills";
import { getPatients } from "@/api/patients";
import BillDetails from "./BillDetails";

export default function BillList() {
  const [bills, setBills] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setBills(await getBills());
      setPatients(await getPatients());
    })();
  }, []);

  const nameById = (arr: any[], id: number, field = "name") =>
    arr.find((x) => x.id === id)?.[field] || id;

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bill?")) return;
    await deleteBill(id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="mt-6 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">All Bills</h2>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Patient</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4">No bills found.</td>
            </tr>
          ) : (
            bills.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2 border">{nameById(patients, b.patient_id)}</td>
                <td className="px-4 py-2 border">₹{b.amount.toFixed(2)}</td>
                <td className="px-4 py-2 border">{b.description}</td>
                <td className="px-4 py-2 border">{new Date(b.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border space-x-2">
                  <button onClick={() => setSelectedBill(b)} className="text-blue-600 underline">View</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {selectedBill && (
        <BillDetails bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </div>
  );
} 