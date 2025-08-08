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
      setAppointments(appointmentsData);
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
        setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? updatedAppointment : a));
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

  const handleDeleteAppointment = async (appointmentId: number) => {
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

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : `Doctor ${doctorId}`;
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
          <Table headers={["Patient", "Doctor", "Date & Time", "Duration", "Reason", "Status", "Actions"]}>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-emerald-400">
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{getPatientName(appointment.patient_id)}</td>
                  <td>{getDoctorName(appointment.doctor_id)}</td>
                  <td>{new Date(appointment.scheduled_datetime).toLocaleString()}</td>
                  <td>{appointment.duration_minutes} min</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(appointment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
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
          </Table>
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
