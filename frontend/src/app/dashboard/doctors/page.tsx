"use client";
import Card from "@/components/ui/Card";
import DoctorForm from "@/components/doctors/DoctorForm";
import DoctorList from "@/components/doctors/DoctorList";
import { useState, useEffect } from "react";
import { getDoctors } from "@/api/doctors";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);

  const loadDoctors = async () => {
    setDoctors(await getDoctors());
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Doctors Module</h1>
      <DoctorForm onDoctorAdded={loadDoctors} />
      <div className="mt-6">
        <DoctorList doctors={doctors} />
      </div>
    </Card>
  );
}
