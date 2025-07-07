"use client";

import Table from "@/components/ui/Table";

export default function DoctorList({ doctors }: { doctors: any[] }) {
  return (
    <Table headers={["Name", "Specialty", "Phone", "Email"]}>
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
            <td>{d.specialty}</td>
            <td>{d.phone}</td>
            <td>{d.email}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
