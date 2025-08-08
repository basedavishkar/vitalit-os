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
      setBills(billsData as Bill[]);
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
        setBills(prev => prev.map(b => b.id === editingBill.id ? updatedBill as Bill : b));
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
      await billingAPI.delete(billId.toString());
      setBills(prev => prev.filter(b => b.id !== billId.toString()));
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

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{getPatientName(bill.patientId)}</p>
                          <p className="text-sm text-gray-500">{bill.patientId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">${bill.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {new Date(bill.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          bill.status === 'overdue' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{bill.description}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(bill)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
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
              </tbody>
            </table>
          </div>
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