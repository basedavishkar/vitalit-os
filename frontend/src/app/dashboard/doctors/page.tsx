'use client';

import { useState, useEffect } from 'react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  license: string;
  experience: number;
  status: 'active' | 'inactive';
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setDoctors([
        { id: 1, name: "Dr. Sarah Johnson", specialization: "Cardiology", email: "sarah.johnson@hospital.com", phone: "+1-555-0101", license: "MD12345", experience: 15, status: "active" },
        { id: 2, name: "Dr. Michael Chen", specialization: "Neurology", email: "michael.chen@hospital.com", phone: "+1-555-0102", license: "MD12346", experience: 12, status: "active" },
        { id: 3, name: "Dr. Emily Davis", specialization: "Pediatrics", email: "emily.davis@hospital.com", phone: "+1-555-0103", license: "MD12347", experience: 8, status: "active" },
        { id: 4, name: "Dr. Robert Wilson", specialization: "Orthopedics", email: "robert.wilson@hospital.com", phone: "+1-555-0104", license: "MD12348", experience: 20, status: "inactive" },
        { id: 5, name: "Dr. Lisa Brown", specialization: "Dermatology", email: "lisa.brown@hospital.com", phone: "+1-555-0105", license: "MD12349", experience: 10, status: "active" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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
            Doctors
          </h1>
          <p className="text-gray-600 mt-1">Manage doctor profiles and schedules</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl">
          + Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Doctors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                {doctor.name.charAt(0)}
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                doctor.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {doctor.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
            <p className="text-blue-600 font-medium mb-3">{doctor.specialization}</p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">📧</span>
                {doctor.email}
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">📞</span>
                {doctor.phone}
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">🏥</span>
                License: {doctor.license}
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">⏰</span>
                {doctor.experience} years experience
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View Profile
              </button>
              <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
