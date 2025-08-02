'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { patientApi } from '@/lib/api/patients';
import { doctorApi } from '@/lib/api/doctors';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  monthlyRevenue: number;
  activePatients: number;
  pendingAppointments: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activePatients: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load patients and doctors
      const [patients, doctors] = await Promise.all([
        patientApi.getPatients(),
        doctorApi.getDoctors(),
      ]);

      // Calculate stats
      const totalPatients = patients.length;
      const totalDoctors = doctors.length;
      const activePatients = patients.length; // Simplified for now
      const todayAppointments = 0; // Will be implemented with appointments API
      const monthlyRevenue = 0; // Will be implemented with billing API
      const pendingAppointments = 0; // Will be implemented with appointments API

      setStats({
        totalPatients,
        totalDoctors,
        todayAppointments,
        monthlyRevenue,
        activePatients,
        pendingAppointments,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Quick actions
  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: Users,
      href: '/dashboard/patients',
      color: 'bg-blue-500',
    },
    {
      title: 'Add Doctor',
      description: 'Add a new doctor',
      icon: UserCheck,
      href: '/dashboard/doctors',
      color: 'bg-green-500',
    },
    {
      title: 'Book Appointment',
      description: 'Schedule an appointment',
      icon: Calendar,
      href: '/dashboard/appointments',
      color: 'bg-purple-500',
    },
    {
      title: 'View Reports',
      description: 'Financial and medical reports',
      icon: TrendingUp,
      href: '/dashboard/reports',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Vitalit Hospital Management System</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalPatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.activePatients} active patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalDoctors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.todayAppointments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAppointments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => window.location.href = action.href}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New patient registered</p>
                <p className="text-xs text-muted-foreground">John Doe was added to the system</p>
              </div>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-muted-foreground">Dr. Smith - 2:30 PM today</p>
              </div>
              <span className="text-xs text-muted-foreground">15 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$150 consultation fee</p>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
  