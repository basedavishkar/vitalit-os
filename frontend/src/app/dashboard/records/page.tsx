"use client";
import Card from "@/components/ui/Card";
import RecordForm from "@/components/records/RecordForm";
import RecordList from "@/components/records/RecordList";
import { useState, useEffect } from 'react';
import { getRecords } from '@/api/records';
import { getPatients } from '@/api/patients';
import { getDoctors } from '@/api/doctors';

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setRecords(await getRecords());
      setPatients(await getPatients());
      setDoctors(await getDoctors());
    })();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      <RecordForm onRecordAdded={async () => setRecords(await getRecords())} />
      <div className="mt-6">
        <RecordList records={records} patients={patients} doctors={doctors} />
      </div>
    </Card>
  );
}
