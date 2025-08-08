'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AnimatedStatsCard } from '@/components/charts/AnimatedStatsCard';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedPieChart } from '@/components/charts/AnimatedPieChart';
import { dashboardAPI, analyticsAPI } from '@/lib/api';
import { DashboardStats } from '@/types/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch dashboard stats
        const statsData = await dashboardAPI.getStatsDev();
        setStats(statsData);
        
        // Fetch analytics data
        const [patientGrowth, revenueTrends, departmentDistribution, genderDistribution, ageGroupDistribution] = await Promise.all([
          analyticsAPI.getPatientGrowth(),
          analyticsAPI.getRevenueTrends(),
          analyticsAPI.getDepartmentDistribution(),
          analyticsAPI.getGenderDistribution(),
          analyticsAPI.getAgeGroupDistribution()
        ]);
        
        setAnalyticsData({
          patientGrowth,
          revenueTrends,
          departmentDistribution,
          genderDistribution,
          ageGroupDistribution
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Dashboard</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue' as const,
      description: 'Registered patients in the system'
    },
    {
      title: 'Active Doctors',
      value: stats?.totalDoctors || 0,
      change: '+5%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'green' as const,
      description: 'Currently active medical staff'
    },
    {
      title: 'Today\'s Appointments',
      value: stats?.todayAppointments || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple' as const,
      description: 'Scheduled appointments for today'
    },
    {
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue || 0,
      change: '+15%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'orange' as const,
      description: 'Total revenue this month',
      formatValue: (val: number) => `$${val.toLocaleString()}`
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome to VITALIt. Here's an overview of your healthcare system.
        </p>
      </div>

      {/* Animated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <AnimatedStatsCard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            changeType={card.changeType}
            icon={card.icon}
            color={card.color}
            description={card.description}
            formatValue={card.formatValue}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Main Charts Section */}
      {analyticsData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedLineChart
              title="Patient Growth"
              description="Monthly patient registration trends"
              data={analyticsData.patientGrowth}
              height={300}
            />
            <AnimatedLineChart
              title="Revenue Trends"
              description="Monthly revenue performance"
              data={analyticsData.revenueTrends}
              height={300}
            />
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AnimatedPieChart
              title="Department Distribution"
              description="Patient distribution by department"
              data={analyticsData.departmentDistribution}
              height={250}
            />
            <AnimatedPieChart
              title="Gender Distribution"
              description="Patient distribution by gender"
              data={analyticsData.genderDistribution}
              height={250}
            />
            <AnimatedBarChart
              title="Age Group Distribution"
              description="Patient distribution by age groups"
              data={analyticsData.ageGroupDistribution}
              height={250}
            />
          </div>
        </>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks and shortcuts for daily operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">New Patient</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-200 transition-all">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Schedule</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 transition-all">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-medium">Create Bill</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 transition-all">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">View Records</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600">
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">New patient registered</p>
                  <p className="text-xs text-gray-500">Sarah Johnson - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-xl">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Appointment scheduled</p>
                  <p className="text-xs text-gray-500">Dr. Smith - 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-xl">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">$1,250.00 - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-xl">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Inventory updated</p>
                  <p className="text-xs text-gray-500">Medication restocked - 2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">System Status</CardTitle>
            <CardDescription className="text-gray-600">
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">API Server</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Storage</span>
                </div>
                <span className="text-xs text-yellow-600 font-medium">75% Used</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Backup</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Last: 2h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Performance Metrics</CardTitle>
            <CardDescription className="text-gray-600">
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">Response Time</span>
                <span className="text-xs text-green-600 font-medium">45ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">Uptime</span>
                <span className="text-xs text-green-600 font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">Active Sessions</span>
                <span className="text-xs text-blue-600 font-medium">1,247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">Data Sync</span>
                <span className="text-xs text-green-600 font-medium">Real-time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
  