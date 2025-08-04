'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  overview: {
    total_patients: number;
    total_doctors: number;
    total_appointments: number;
    total_bills: number;
  };
  today: {
    appointments: number;
    new_patients: number;
  };
  monthly: {
    appointments: number;
    revenue: number;
  };
  yearly: {
    revenue: number;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('http://localhost:8000/analytics/dashboard/overview');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback data
      setAnalyticsData({
        overview: {
          total_patients: 1247,
          total_doctors: 23,
          total_appointments: 5678,
          total_bills: 3456
        },
        today: {
          appointments: 89,
          new_patients: 12
        },
        monthly: {
          appointments: 2345,
          revenue: 45678
        },
        yearly: {
          revenue: 567890
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive healthcare performance insights</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Export Report
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview.total_patients || 0}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview.total_doctors || 0}</p>
              <p className="text-sm text-green-600 mt-1">+3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview.total_appointments || 0}</p>
              <p className="text-sm text-green-600 mt-1">+8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${analyticsData?.monthly.revenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-green-600 mt-1">+15% from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">📊</span>
              <p className="text-gray-600 mt-2">Chart visualization</p>
              <p className="text-sm text-gray-500">Appointment volume over time</p>
            </div>
          </div>
        </div>

        {/* Revenue Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Analysis</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">📈</span>
              <p className="text-gray-600 mt-2">Chart visualization</p>
              <p className="text-sm text-gray-500">Revenue trends and projections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <p className="font-bold text-blue-700 text-2xl">98.5%</p>
            <p className="text-blue-600 font-medium">System Uptime</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <p className="font-bold text-green-700 text-2xl">94.2%</p>
            <p className="text-green-600 font-medium">Patient Satisfaction</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">⏱️</span>
            </div>
            <p className="font-bold text-purple-700 text-2xl">12.3 min</p>
            <p className="text-purple-600 font-medium">Avg Wait Time</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New patient registered', user: 'Dr. Sarah Johnson', time: '2 minutes ago', type: 'patient' },
            { action: 'Appointment completed', user: 'Dr. Michael Chen', time: '15 minutes ago', type: 'appointment' },
            { action: 'Payment received', user: 'Admin', time: '1 hour ago', type: 'payment' },
            { action: 'Medical record updated', user: 'Dr. Emily Wilson', time: '2 hours ago', type: 'record' },
            { action: 'Inventory restocked', user: 'Admin', time: '3 hours ago', type: 'inventory' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'patient' ? 'bg-blue-100' :
                activity.type === 'appointment' ? 'bg-green-100' :
                activity.type === 'payment' ? 'bg-yellow-100' :
                'bg-purple-100'
              }`}>
                <span className="text-sm">
                  {activity.type === 'patient' ? '👥' :
                   activity.type === 'appointment' ? '📅' :
                   activity.type === 'payment' ? '💰' : '📋'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">by {activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 