'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  recentAppointments: Array<{
    id: number;
    patientName: string;
    doctorName: string;
    date: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalPatients: 1247,
        totalDoctors: 23,
        totalAppointments: 89,
        totalRevenue: 45678,
        recentAppointments: [
          { id: 1, patientName: "John Doe", doctorName: "Dr. Smith", date: "2024-01-15", status: "Confirmed" },
          { id: 2, patientName: "Jane Smith", doctorName: "Dr. Johnson", date: "2024-01-15", status: "Pending" },
          { id: 3, patientName: "Mike Wilson", doctorName: "Dr. Brown", date: "2024-01-16", status: "Confirmed" },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, trend }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
  }) => (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">↑ {trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-white/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening with your healthcare system today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon="👥"
          color="bg-blue-100"
          trend="+12% this month"
        />
        <StatCard
          title="Active Doctors"
          value={stats.totalDoctors}
          icon="👨‍⚕️"
          color="bg-green-100"
          trend="+3 new"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.totalAppointments}
          icon="📅"
          color="bg-purple-100"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="bg-emerald-100"
          trend="+8% vs last month"
        />
      </div>

      {/* Recent appointments */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
          <p className="text-gray-600 text-sm mt-1">Latest scheduled appointments</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {appointment.patientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">with {appointment.doctorName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    appointment.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">➕</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Patient</h3>
              <p className="text-sm text-gray-600">Register new patient</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">📅</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Schedule Appointment</h3>
              <p className="text-sm text-gray-600">Book new appointment</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  