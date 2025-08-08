"use client";

import { useState, useEffect } from "react";
import Table from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Appointment, AppointmentCreate, AppointmentUpdate, Patient, Doctor } from '@/types/api';
import { appointmentsAPI, patientsAPI, doctorsAPI } from '@/lib/api';
import AppointmentForm from '@/components/forms/AppointmentForm';
import toast from 'react-hot-toast';

interface AppointmentListProps {
  appointments?: Appointment[];
  onAppointmentsChange?: () => void;
}

export default function AppointmentList({ appointments: initialAppointments, onAppointmentsChange }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        appointmentsAPI.getAll(),
        patientsAPI.getAll(),
        doctorsAPI.getAll()
      ]);
      setAppointments(appointmentsData as Appointment[]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (appointmentData: AppointmentCreate | AppointmentUpdate) => {
    try {
      if (editingAppointment) {
        const updatedAppointment = await appointmentsAPI.update(editingAppointment.id, appointmentData as AppointmentUpdate);
        setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? updatedAppointment as Appointment : a));
        setShowEditForm(false);
        setEditingAppointment(null);
        toast.success('Appointment updated successfully');
      } else {
        const newAppointment = await appointmentsAPI.create(appointmentData as AppointmentCreate);
        setAppointments(prev => [...prev, newAppointment]);
        setShowAddForm(false);
        toast.success('Appointment added successfully');
      }
      if (onAppointmentsChange) onAppointmentsChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await appointmentsAPI.delete(appointmentId);
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      toast.success('Appointment deleted successfully');
      if (onAppointmentsChange) onAppointmentsChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete appointment');
    }
  };

  const openEditForm = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditForm(true);
  };

  const openAddForm = () => {
    setShowAddForm(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointments</CardTitle>
          <Button 
            className="flex items-center gap-2"
            onClick={openAddForm}
          >
            <span>➕</span> Add Appointment
          </Button>
        </div>

      </CardHeader>
      <CardContent>
        {loading && appointments.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{getPatientName(appointment.patientId)}</p>
                          <p className="text-sm text-gray-500">{appointment.patientId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{getDoctorName(appointment.doctorId)}</p>
                          <p className="text-sm text-gray-500">{appointment.doctorId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{appointment.duration} min</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{appointment.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(appointment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAppointment(appointment.id)}
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
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            patients={patients}
            doctors={doctors}
            onAppointmentAdded={handleCreateOrUpdate}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <AppointmentForm 
              appointment={editingAppointment}
              patients={patients}
              doctors={doctors}
              onAppointmentAdded={handleCreateOrUpdate}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
