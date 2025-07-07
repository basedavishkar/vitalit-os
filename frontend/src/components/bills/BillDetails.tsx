"use client";

import { useEffect, useRef } from "react";
import { getPatients } from "@/api/patients";
import { Bill } from '@/types';

export default function BillDetails({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      await getPatients();
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
    <div ref={printRef} className="bg-white p-8 rounded-xl shadow-xl max-w-2xl mx-auto">
      <button onClick={onClose} className="mt-6 btn w-full">Close</button>
      <button onClick={handlePrint} className="mt-2 btn w-full">Print</button>
    </div>
  );
} 