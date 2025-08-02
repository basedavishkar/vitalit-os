"use client";
import { Card } from "@/components/ui/Card";
import RecordForm from "@/components/records/RecordForm";
import RecordList from "@/components/records/RecordList";
import { useState, useEffect } from 'react';
import { getRecords } from '@/api/records';
import { getPatients } from "@/api/patients";
import { getDoctors } from "@/api/doctors";
import { MedicalRecord, Patient, Doctor } from '@/types';

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadPatients = async () => {
    setPatients(await getPatients());
  };
  const loadDoctors = async () => {
    setDoctors(await getDoctors());
  };

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      <RecordForm onRecordAdded={async () => setRecords(await getRecords())} patients={patients} doctors={doctors} />
      <div className="mt-6">
        <RecordList records={records} />
      </div>
    </Card>
  );
}
