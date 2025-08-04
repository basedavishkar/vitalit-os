"use client";

import Table from "@/components/ui/table";
import { Patient } from '@/types/api';

export default function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <Table headers={["Name", "Age", "Gender", "Address", "Contact"]}>
      {patients.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-8 text-emerald-400">
            No patients found.
          </td>
        </tr>
      ) : (
        patients.map((p) => (
          <tr key={p.id}>
            <td>{`${p.first_name} ${p.last_name}`}</td>
            <td>{p.gender}</td>
            <td>{p.address}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
