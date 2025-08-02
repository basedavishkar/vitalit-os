'use client';

import { useState, useEffect } from 'react';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPatients([
        { id: 1, name: "John Doe", email: "john@example.com", phone: "+1-555-0123", age: 35, gender: "Male", bloodType: "O+", lastVisit: "2024-01-10", status: "active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1-555-0124", age: 28, gender: "Female", bloodType: "A+", lastVisit: "2024-01-12", status: "active" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1-555-0125", age: 42, gender: "Male", bloodType: "B-", lastVisit: "2024-01-08", status: "inactive" },
        { id: 4, name: "Sarah Wilson", email: "sarah@example.com", phone: "+1-555-0126", age: 31, gender: "Female", bloodType: "AB+", lastVisit: "2024-01-15", status: "active" },
        { id: 5, name: "David Brown", email: "david@example.com", phone: "+1-555-0127", age: 55, gender: "Male", bloodType: "O-", lastVisit: "2024-01-05", status: "active" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Patients Management
          </h1>
          <p className="text-sm text-neutral-300 mt-1">Manage patient records and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
          + Add Patient
        </button>
      </div>

      {/* Search and filters */}
      <div className="card-elevated p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search patients..."
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
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Total Patients</p>
              <p className="text-xl font-bold text-white">{patients.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Active Patients</p>
              <p className="text-xl font-bold text-white">{patients.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">New This Month</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">🆕</span>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Avg Age</p>
              <p className="text-xl font-bold text-white">
                {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id} 
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
                {patient.name.charAt(0)}
              </div>
              <span 
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  patient.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-neutral-500/20 text-neutral-400'
                }`}
                style={{
                  display: 'inline-flex',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {patient.status}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-white mb-1">{patient.name}</h3>
            <p className="text-xs text-neutral-400 mb-3">{patient.email}</p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone:</span>
                <span className="text-white">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Age:</span>
                <span className="text-white">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Blood Type:</span>
                <span className="text-white">{patient.bloodType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Last Visit:</span>
                <span className="text-white">{patient.lastVisit}</span>
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
                View Details
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
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
