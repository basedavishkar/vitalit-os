"use client";

import Table from "@/components/ui/Table";
import { Bill, Patient } from '@/types';

export default function BillList({ bills, patients }: { bills: Bill[]; patients: Patient[] }) {
  const getPatientName = (id: number) => patients.find((p) => p.id === id)?.name || id;
  return (
    <Table headers={["Patient", "Amount", "Date", "Description"]}>
      {bills.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center py-8 text-emerald-400">
            No bills found.
          </td>
        </tr>
      ) : (
        bills.map((b) => (
          <tr key={b.id}>
            <td>{getPatientName(b.patient_id)}</td>
            <td>${b.amount}</td>
            <td>{b.date}</td>
            <td>{b.description}</td>
          </tr>
        ))
      )}
    </Table>
  );
} 