'use client';

import { useState, useEffect } from 'react';
import AppointmentList from '@/components/appointments/AppointmentList';

interface AppointmentDisplay {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export default function AppointmentsPage() {
  return <AppointmentList />
}
