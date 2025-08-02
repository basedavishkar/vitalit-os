"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  datetime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAppointments([
        { id: 1, patientName: "John Doe", doctorName: "Dr. Sarah Johnson", datetime: "2024-01-15T10:00:00", reason: "Annual Checkup", status: "scheduled" },
        { id: 2, patientName: "Jane Smith", doctorName: "Dr. Michael Chen", datetime: "2024-01-15T14:30:00", reason: "Follow-up", status: "completed" },
        { id: 3, patientName: "Mike Johnson", doctorName: "Dr. Emily Davis", datetime: "2024-01-16T09:00:00", reason: "Consultation", status: "scheduled" },
        { id: 4, patientName: "Sarah Wilson", doctorName: "Dr. Robert Wilson", datetime: "2024-01-14T16:00:00", reason: "Emergency", status: "cancelled" },
        { id: 5, patientName: "David Brown", doctorName: "Dr. Lisa Brown", datetime: "2024-01-17T11:30:00", reason: "Routine Visit", status: "scheduled" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">Manage patient appointments and schedules</p>
        </div>
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + New Appointment
        </motion.button>
      </div>

      {/* Search */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200">
            <option>All Status</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                  📅
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                  <p className="text-blue-600 font-medium">{appointment.doctorName}</p>
                  <p className="text-gray-600 text-sm">{appointment.reason}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date(appointment.datetime).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(appointment.datetime).toLocaleTimeString()}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View Details
              </button>
              <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Reschedule
              </button>
              <button className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
