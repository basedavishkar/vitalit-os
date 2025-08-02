'use client';

import { useState, useEffect } from 'react';

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  status: 'active' | 'inactive' | 'on_leave';
  patientsCount: number;
  rating: number;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setDoctors([
        { id: 1, name: "Dr. Michael Chen", email: "michael.chen@vitalit.com", phone: "+1-555-0101", specialization: "Cardiology", experience: 12, status: "active", patientsCount: 156, rating: 4.8 },
        { id: 2, name: "Dr. Emily Wilson", email: "emily.wilson@vitalit.com", phone: "+1-555-0102", specialization: "Dermatology", experience: 8, status: "active", patientsCount: 89, rating: 4.9 },
        { id: 3, name: "Dr. James Brown", email: "james.brown@vitalit.com", phone: "+1-555-0103", specialization: "Orthopedics", experience: 15, status: "on_leave", patientsCount: 203, rating: 4.7 },
        { id: 4, name: "Dr. Amanda Garcia", email: "amanda.garcia@vitalit.com", phone: "+1-555-0104", specialization: "Pediatrics", experience: 6, status: "active", patientsCount: 67, rating: 4.6 },
        { id: 5, name: "Dr. Robert Davis", email: "robert.davis@vitalit.com", phone: "+1-555-0105", specialization: "Neurology", experience: 18, status: "inactive", patientsCount: 134, rating: 4.5 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-neutral-500/20 text-neutral-400';
      case 'on_leave': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-neutral-500/20 text-neutral-400';
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
            Doctors Management
          </h1>
          <p className="text-sm text-neutral-300 mt-1">Manage medical staff and specialists</p>
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
          + Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Total Doctors</p>
              <p className="text-xl font-bold text-white">{doctors.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">👨‍⚕️</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Active Doctors</p>
              <p className="text-xl font-bold text-white">{doctors.filter(d => d.status === 'active').length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Avg Experience</p>
              <p className="text-xl font-bold text-white">
                {Math.round(doctors.reduce((sum, d) => sum + d.experience, 0) / doctors.length)}y
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Avg Rating</p>
              <p className="text-xl font-bold text-white">
                {(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="card-elevated p-4 hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
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
                  fontSize: '0.875rem',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                }}
              >
                {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
              </div>
              <span 
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doctor.status)}`}
                style={{
                  display: 'inline-flex',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {doctor.status.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-white mb-1">{doctor.name}</h3>
            <p className="text-xs text-neutral-400 mb-3">{doctor.specialization}</p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <span className="text-white">{doctor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Experience:</span>
                <span className="text-white">{doctor.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Patients:</span>
                <span className="text-white">{doctor.patientsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rating:</span>
                <span className="text-white">⭐ {doctor.rating}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
              <button 
                className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  borderRadius: '0.5rem',
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
                View Profile
              </button>
              <button 
                className="flex-1 px-3 py-2 bg-neutral-500/20 text-neutral-400 rounded-lg text-xs font-medium hover:bg-neutral-500/30 transition-colors"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(115, 115, 115, 0.2)',
                  color: '#a3a3a3',
                  borderRadius: '0.5rem',
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
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
