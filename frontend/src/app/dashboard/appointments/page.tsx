"use client";
import Card from "@/components/ui/Card";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentList from "@/components/appointments/AppointmentList";
import { useState, useEffect } from "react";
import { getAppointments } from "@/api/appointments";
import { Appointment } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = async () => {
    setAppointments(await getAppointments());
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Appointments Module</h1>
      <AppointmentForm onAppointmentAdded={loadAppointments} />
      <div className="mt-6">
        <AppointmentList appointments={appointments} />
      </div>
    </Card>
  );
}
