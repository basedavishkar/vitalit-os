"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Patient, BillCreate, BillUpdate, Bill } from '@/types/api';

interface BillFormProps {
  onBillAdded: (data: BillCreate | BillUpdate) => Promise<void>;
  onCancel?: () => void;
  patients: Patient[];
  bill?: Bill;
}

export default function BillForm({ onBillAdded, onCancel, patients, bill }: BillFormProps) {
  const [form, setForm] = useState({
    patient_id: bill?.patient_id || 0,
    appointment_id: bill?.appointment_id || undefined as number | undefined,
    bill_date: bill?.bill_date ? new Date(bill.bill_date).toISOString().split('T')[0] : "",
    due_date: bill?.due_date ? new Date(bill.due_date).toISOString().split('T')[0] : "",
    subtotal: bill?.subtotal || 0,
    tax_amount: bill?.tax_amount || 0,
    discount_amount: bill?.discount_amount || 0,
    total_amount: bill?.total_amount || 0,
    notes: bill?.notes || "",
    bill_items: bill?.bill_items || [{
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const billData: BillCreate | BillUpdate = {
        ...form,
        patient_id: form.patient_id,
        bill_date: new Date(form.bill_date).toISOString(),
        due_date: new Date(form.due_date).toISOString(),
        bill_items: form.bill_items
      };
      
      await onBillAdded(billData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Patient</label>
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded"
            >
              <option value={0}>Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{`${p.first_name} ${p.last_name}`}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Bill Date</label>
            <input
              name="bill_date"
              type="date"
              value={form.bill_date}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Due Date</label>
          <input
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Subtotal</label>
            <input
              name="subtotal"
              type="number"
              step="0.01"
              value={form.subtotal}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Tax Amount</label>
            <input
              name="tax_amount"
              type="number"
              step="0.01"
              value={form.tax_amount}
              onChange={handleChange}
              placeholder="0.00"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-emerald-700 text-lg">Discount Amount</label>
            <input
              name="discount_amount"
              type="number"
              step="0.01"
              value={form.discount_amount}
              onChange={handleChange}
              placeholder="0.00"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Total Amount</label>
          <input
            name="total_amount"
            type="number"
            step="0.01"
            value={form.total_amount}
            onChange={handleChange}
            required
            placeholder="0.00"
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-emerald-700 text-lg">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional notes about the bill"
            className="p-2 border border-gray-300 rounded h-20"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Saving...' : bill ? 'Update Bill' : 'Add Bill'}
          </Button>
        </div>
      </form>
    </div>
  );
} 