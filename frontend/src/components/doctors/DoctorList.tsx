"use client";

import Table from "@/components/ui/table";
import { Doctor } from '@/types';

export default function DoctorList({ doctors }: { doctors: Doctor[] }) {
  return (
    <Table headers={["Name", "Specialization", "Phone", "Email"]}>
      {doctors.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center py-8 text-emerald-400">
            No doctors found.
          </td>
        </tr>
      ) : (
        doctors.map((d) => (
          <tr key={d.id}>
            <td>{d.name}</td>
            <td>{d.specialization}</td>
            <td>{d.phone}</td>
            <td>{d.email}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
