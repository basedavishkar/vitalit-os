"use client";

import { MedicalRecord } from '@/types/api';

export default function RecordList({ records }: { records: MedicalRecord[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Doctor ID</th>
          <th>Diagnosis</th>
          <th>Prescription Notes</th>
          <th>Visit Date</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id}>
            <td>{r.patient_id}</td>
            <td>{r.doctor_id}</td>
            <td>{r.diagnosis}</td>
            <td>{r.prescription_notes}</td>
            <td>{r.visit_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 