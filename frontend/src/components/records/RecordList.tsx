"use client";

import Table from "@/components/ui/Table";
import { MedicalRecord } from '@/types';

export default function RecordList({ records }: { records: MedicalRecord[] }) {
  return (
    <Table headers={["Patient ID", "Doctor ID", "Diagnosis", "Prescription", "Notes", "Date"]}>
      {records.length === 0 ? (
        <tr>
          <td colSpan={6} className="text-center py-8 text-emerald-400">
            No records found.
          </td>
        </tr>
      ) : (
        records.map((r) => (
          <tr key={r.id}>
            <td>{r.patient_id}</td>
            <td>{r.doctor_id}</td>
            <td>{r.diagnosis}</td>
            <td>{r.prescription}</td>
            <td>{r.notes}</td>
            <td>{r.date}</td>
          </tr>
        ))
      )}
    </Table>
  );
} 