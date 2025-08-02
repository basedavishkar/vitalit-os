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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Patients
          </h1>
          <p className="text-gray-600 mt-1">Manage patient records and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Add Patient
        </button>
      </div>

      {/* Search and filters */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Patients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                {patient.name.charAt(0)}
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                patient.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {patient.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{patient.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{patient.email}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-900">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Age:</span>
                <span className="text-gray-900">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blood Type:</span>
                <span className="text-gray-900">{patient.bloodType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Visit:</span>
                <span className="text-gray-900">{patient.lastVisit}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4 pt-4 border-t border-white/20">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🆕</span>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Age</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
