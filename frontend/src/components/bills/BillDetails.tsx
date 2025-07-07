"use client";

import { useEffect, useState, useRef } from "react";
import { getPatients } from "@/api/patients";

export default function BillDetails({ bill, onClose }: { bill: any; onClose: () => void }) {
  const [patient, setPatient] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const patients = await getPatients();
      setPatient(patients.find((p: any) => p.id === bill.patient_id));
    })();
  }, [bill]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open("", "Print-Window");
      if (win) {
        win.document.open();
        win.document.write(`
          <html><head><title>Bill</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .bill-header { text-align: center; margin-bottom: 32px; }
            .bill-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .bill-table th, .bill-table td { border: 1px solid #ccc; padding: 8px; }
            .bill-footer { margin-top: 32px; font-size: 0.9em; color: #555; }
          </style>
          </head><body>` + printContents + `</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
      }
    }
  };

  if (!bill) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">✕</button>
        <div ref={printRef}>
          <div className="bill-header">
            <h2 className="text-2xl font-bold mb-2">VITALIt Hospital</h2>
            <div>123 Main St, City, Country | +1 234 567 8900</div>
            <div className="mt-2 text-lg font-semibold">Patient Bill</div>
          </div>
          <div className="mb-4">
            <strong>Patient:</strong> {patient ? patient.name : bill.patient_id}<br />
            <strong>Patient ID:</strong> {bill.patient_id}<br />
            <strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}<br />
          </div>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bill.description}</td>
                <td>₹{bill.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-right font-bold text-lg mb-2">
            Total: ₹{bill.amount.toFixed(2)}
          </div>
          <div className="bill-footer">
            <div>Status: {bill.paid ? "Paid" : "Unpaid"}</div>
            <div>Thank you for choosing VITALIt Hospital.</div>
          </div>
        </div>
        <button onClick={handlePrint} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full">Print Bill</button>
      </div>
    </div>
  );
} 