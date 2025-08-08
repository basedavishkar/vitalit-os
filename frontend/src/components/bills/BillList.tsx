"use client";

import { useState, useEffect } from "react";
import Table from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bill, BillCreate, BillUpdate, Patient } from '@/types/api';
import { billingAPI, patientsAPI } from '@/lib/api';
import BillForm from '@/components/forms/BillForm';
import toast from 'react-hot-toast';

interface BillListProps {
  bills?: Bill[];
  onBillsChange?: () => void;
}

export default function BillList({ bills: initialBills, onBillsChange }: BillListProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills || []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, patientsData] = await Promise.all([
        billingAPI.getAll(),
        patientsAPI.getAll()
      ]);
      setBills(billsData);
      setPatients(patientsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (billData: BillCreate | BillUpdate) => {
    try {
      if (editingBill) {
        const updatedBill = await billingAPI.update(editingBill.id, billData as BillUpdate);
        setBills(prev => prev.map(b => b.id === editingBill.id ? updatedBill : b));
        setShowEditForm(false);
        setEditingBill(null);
        toast.success('Bill updated successfully');
      } else {
        const newBill = await billingAPI.create(billData as BillCreate);
        setBills(prev => [...prev, newBill]);
        setShowAddForm(false);
        toast.success('Bill added successfully');
      }
      if (onBillsChange) onBillsChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bill');
    }
  };

  const handleDeleteBill = async (billId: number) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    try {
      await billingAPI.delete(billId);
      setBills(prev => prev.filter(b => b.id !== billId));
      toast.success('Bill deleted successfully');
      if (onBillsChange) onBillsChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bill');
    }
  };

  const openEditForm = (bill: Bill) => {
    setEditingBill(bill);
    setShowEditForm(true);
  };

  const openAddForm = () => {
    setShowAddForm(true);
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bills</CardTitle>
          <Button 
            className="flex items-center gap-2"
            onClick={openAddForm}
          >
            <span>➕</span> Add Bill
          </Button>
        </div>

      </CardHeader>
      <CardContent>
        {loading && bills.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bills...</p>
            </div>
          </div>
        ) : (
          <Table headers={["Patient", "Amount", "Date", "Status", "Description", "Actions"]}>
            {bills.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-emerald-400">
                  No bills found.
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{getPatientName(bill.patient_id)}</td>
                  <td>{formatCurrency(bill.total_amount)}</td>
                  <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bill.payment_status)}`}>
                      {bill.payment_status}
                    </span>
                  </td>
                  <td>{bill.notes || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(bill)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBill(bill.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          <BillForm 
            patients={patients}
            onBillAdded={handleCreateOrUpdate}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editingBill && (
            <BillForm 
              bill={editingBill}
              patients={patients}
              onBillAdded={handleCreateOrUpdate}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 