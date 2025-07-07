"use client";

import Table from "@/components/ui/Table";
import { Appointment } from '@/types';

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  return (
    <Table headers={["Patient ID", "Doctor ID", "Date", "Time", "Reason"]}>
      {appointments.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-8 text-emerald-400">
            No appointments found.
          </td>
        </tr>
      ) : (
        appointments.map((a) => (
          <tr key={a.id}>
            <td>{a.patient_id}</td>
            <td>{a.doctor_id}</td>
            <td>{a.date}</td>
            <td>{a.time}</td>
            <td>{a.reason}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
