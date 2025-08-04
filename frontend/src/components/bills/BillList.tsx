"use client";

import Table from "@/components/ui/table";
import { Bill, Patient } from '@/types/api';

export default function BillList({ bills, patients }: { bills: Bill[]; patients: Patient[] }) {
  const getPatientName = (id: number) => {
    const p = patients.find((p) => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : id;
  };
  return (
    <Table headers={["Patient", "Amount", "Date", "Description"]}>
      {bills.length === 0 ? (
        <tr>
          <td colSpan={4}>No bills found.</td>
        </tr>
      ) : (
        bills.map((bill) => (
          <tr key={bill.id}>
            <td>{getPatientName(bill.patient_id)}</td>
            <td>{bill.total_amount}</td>
            <td>{bill.bill_date}</td>
            <td>{bill.notes}</td>
          </tr>
        ))
      )}
    </Table>
  );
} 