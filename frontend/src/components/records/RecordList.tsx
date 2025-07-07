"use client";

import Table from "@/components/ui/Table";
import { Record } from '@/types';

export default function RecordList({ records }: { records: Record[] }) {
  return (
    <Table headers={["Patient ID", "Doctor ID", "Diagnosis", "Treatment", "Date"]}>
      {records.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-8 text-emerald-400">
            No records found.
          </td>
        </tr>
      ) : (
        records.map((r) => (
          <tr key={r.id}>
            <td>{r.patient_id}</td>
            <td>{r.doctor_id}</td>
            <td>{r.diagnosis}</td>
            <td>{r.treatment}</td>
            <td>{r.date}</td>
          </tr>
        ))
      )}
    </Table>
  );
} 