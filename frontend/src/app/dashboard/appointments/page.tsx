'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAppointments([
        { id: 1, patientName: "Sarah Johnson", doctorName: "Dr. Michael Chen", date: "2024-01-15", time: "10:00 AM", type: "General Checkup", status: "scheduled", notes: "Annual physical examination" },
        { id: 2, patientName: "Robert Davis", doctorName: "Dr. Emily Wilson", date: "2024-01-15", time: "11:30 AM", type: "Cardiology", status: "completed", notes: "Follow-up consultation" },
        { id: 3, patientName: "Lisa Thompson", doctorName: "Dr. James Brown", date: "2024-01-15", time: "2:00 PM", type: "Dermatology", status: "scheduled", notes: "Skin condition evaluation" },
        { id: 4, patientName: "David Miller", doctorName: "Dr. Amanda Garcia", date: "2024-01-14", time: "3:30 PM", type: "Orthopedics", status: "cancelled", notes: "Patient requested cancellation" },
        { id: 5, patientName: "Maria Rodriguez", doctorName: "Dr. Robert Davis", date: "2024-01-16", time: "9:00 AM", type: "Neurology", status: "scheduled", notes: "Initial consultation" },
        { id: 6, patientName: "John Smith", doctorName: "Dr. Emily Wilson", date: "2024-01-14", time: "1:00 PM", type: "Dermatology", status: "no_show", notes: "Patient did not arrive" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'no_show': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return '📅';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'no_show': return '⏰';
      default: return '❓';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-primary">
            Appointments Management
          </h1>
          <p className="text-sm text-neutral-300 mt-1">Schedule and manage patient appointments</p>
        </div>
        <button
          className="btn-primary px-4 py-2 text-sm"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          + Schedule Appointment
        </button>
      </div>

      {/* Search and filters */}
      <div className="card-elevated p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'white',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: 'white',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Total Appointments</p>
              <p className="text-xl font-bold text-white">{appointments.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Scheduled</p>
              <p className="text-xl font-bold text-white">{appointments.filter(a => a.status === 'scheduled').length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Completed</p>
              <p className="text-xl font-bold text-white">{appointments.filter(a => a.status === 'completed').length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Cancelled</p>
              <p className="text-xl font-bold text-white">{appointments.filter(a => a.status === 'cancelled').length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="card-elevated p-4">
        <h2 className="text-lg font-bold text-white mb-4">Recent Appointments</h2>
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300 group"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{appointment.patientName}</p>
                  <p className="text-xs text-neutral-400">{appointment.doctorName}</p>
                  <p className="text-xs text-neutral-500">{appointment.type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-white font-medium">
                  {appointment.date} at {appointment.time}
                </p>
                <span 
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors"
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  }}
                >
                  View
                </button>
                <button 
                  className="px-3 py-1 bg-neutral-500/20 text-neutral-400 rounded text-xs font-medium hover:bg-neutral-500/30 transition-colors"
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(115, 115, 115, 0.2)',
                    color: '#a3a3a3',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(115, 115, 115, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(115, 115, 115, 0.2)';
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
