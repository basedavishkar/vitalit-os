"use client";
import Card from "@/components/ui/Card";
import BillForm from "@/components/bills/BillForm";
import BillList from "@/components/bills/BillList";
import { useState, useEffect } from "react";
import { getBills } from "@/api/bills";
import { getPatients } from "@/api/patients";
import { Bill, Patient } from '@/types';

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const loadBills = async () => {
    setBills(await getBills());
  };
  const loadPatients = async () => {
    setPatients(await getPatients());
  };

  useEffect(() => {
    loadBills();
    loadPatients();
  }, []);

  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      <BillForm onBillAdded={loadBills} patients={patients} />
      <div className="mt-6">
        <BillList bills={bills} patients={patients} />
      </div>
    </Card>
  );
}
