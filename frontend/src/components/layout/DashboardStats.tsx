'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  DollarSign, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRecords: number;
  totalRevenue: number;
  totalInventory: number;
  appointmentsToday: number;
  pendingBills: number;
}

interface ChartData {
  name: string;
  value: number;
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRecords: 0,
    totalRevenue: 0,
    totalInventory: 0,
    appointmentsToday: 0,
    pendingBills: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // In a real app, you'd fetch this from your API
      // For now, we'll use mock data
      const mockStats: DashboardStats = {
        totalPatients: 1247,
        totalDoctors: 23,
        totalAppointments: 89,
        totalRecords: 3456,
        totalRevenue: 125000,
        totalInventory: 456,
        appointmentsToday: 12,
        pendingBills: 34
      };
      
      setStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const appointmentData = [
    { name: 'Mon', appointments: 15 },
    { name: 'Tue', appointments: 22 },
    { name: 'Wed', appointments: 18 },
    { name: 'Thu', appointments: 25 },
    { name: 'Fri', appointments: 20 },
    { name: 'Sat', appointments: 12 },
    { name: 'Sun', appointments: 8 }
  ];

  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 }
  ];

  const patientDistribution = [
    { name: 'Male', value: 45, color: '#3B82F6' },
    { name: 'Female', value: 55, color: '#EC4899' }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
  }> = ({ title, value, icon, trend, trendValue }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          trend="up"
          trendValue="+12% this month"
        />
        <StatCard
          title="Active Doctors"
          value={stats.totalDoctors}
          icon={<Stethoscope className="w-6 h-6 text-green-600" />}
          trend="up"
          trendValue="+2 this month"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.appointmentsToday}
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend="up"
          trendValue="+8% this month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Appointments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Patient Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={patientDistribution}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {patientDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Medical Records</h3>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Records</span>
              <span className="font-semibold">{stats.totalRecords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-green-600">+156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Review</span>
              <span className="font-semibold text-orange-600">23</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Inventory Status</h3>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold">{stats.totalInventory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-semibold text-red-600">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-semibold text-red-600">3</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats; 