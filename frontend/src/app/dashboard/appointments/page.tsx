"use client";
import Card from "@/components/ui/Card";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentList from "@/components/appointments/AppointmentList";
import { useState, useEffect } from "react";
import { getAppointments } from "@/api/appointments";
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";
import { Appointment, Patient, Doctor } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadAppointments = async () => {
    setAppointments(await getAppointments());
  };
  const loadPatients = async () => {
    setPatients(await getPatients());
  };
  const loadDoctors = async () => {
    setDoctors(await getDoctors());
  };

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Appointments Module</h1>
      <AppointmentForm onAppointmentAdded={loadAppointments} patients={patients} doctors={doctors} />
      <div className="mt-6">
        <AppointmentList appointments={appointments} />
      </div>
    </Card>
  );
}
