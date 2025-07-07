"use client";
import Card from "@/components/ui/Card";
import PatientForm from '@/components/Patients/PatientForm';
import PatientList from '@/components/Patients/PatientList';
import { useState, useEffect } from 'react';
import { getPatients } from '@/api/patients';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);

  const loadPatients = async () => {
    setPatients(await getPatients());
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Patients Module</h1>
      <PatientForm onPatientAdded={loadPatients} />
      <div className="mt-6">
        <PatientList patients={patients} />
      </div>
    </Card>
  );
}
