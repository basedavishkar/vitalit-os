"use client";

import { useEffect, useState } from "react";
import { getAppointments } from "@/api/appointments";
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setAppointments(await getAppointments());
      setPatients(await getPatients());
      setDoctors(await getDoctors());
    })();
  }, []);

  const nameById = (arr: any[], id: number, field = "name") =>
    arr.find((x) => x.id === id)?.[field] || id;

  return (
    <div className="mt-6 bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Patient</th>
            <th className="px-4 py-2 border">Doctor</th>
            <th className="px-4 py-2 border">Date &amp; Time</th>
            <th className="px-4 py-2 border">Reason</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-2 border">
                {nameById(patients, a.patient_id)}
              </td>
              <td className="px-4 py-2 border">
                {nameById(doctors, a.doctor_id)}
              </td>
              <td className="px-4 py-2 border">
                {new Date(a.datetime).toLocaleString()}
              </td>
              <td className="px-4 py-2 border">{a.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
