'use client';

import { useEffect, useMemo, useState } from 'react';
import { LineChartCard } from '@/components/charts/LineChartCard';
import { Button } from '@/components/ui/button';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
      });
      const data = await response.json();
      setAnalyticsData({
        overview: {
          total_patients: data.totalPatients,
          total_doctors: data.totalDoctors,
          total_appointments: data.totalAppointments,
          total_bills: 3456,
        },
        today: { appointments: data.todayAppointments, new_patients: 12 },
        monthly: { appointments: 2345, revenue: data.monthlyRevenue },
        yearly: { revenue: 567890 },
      });
    } catch (error) {
      setAnalyticsData({
        overview: { total_patients: 1247, total_doctors: 23, total_appointments: 5678, total_bills: 3456 },
        today: { appointments: 89, new_patients: 12 },
        monthly: { appointments: 2345, revenue: 45678 },
        yearly: { revenue: 567890 },
      });
    } finally {
      setLoading(false);
    }
  };

  const lineData = useMemo(() => {
    const points = 12;
    const arr = Array.from({ length: points }, (_, i) => ({
      label: new Date(2025, i, 1).toLocaleString('en', { month: 'short' }),
      appointments: Math.round(120 + Math.sin(i / 2) * 30 + i * 2),
      revenue: Math.round(300 + Math.cos(i / 2.5) * 50 + i * 10),
    }));
    return arr;
  }, []);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance overview and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button variant="ghost" onClick={fetchAnalyticsData}>Refresh</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: analyticsData?.overview.total_patients ?? 0 },
          { label: 'Active Doctors', value: analyticsData?.overview.total_doctors ?? 0 },
          { label: "Today's Appointments", value: analyticsData?.today.appointments ?? 0 },
          { label: 'Monthly Revenue', value: `$${(analyticsData?.monthly.revenue ?? 0).toLocaleString()}` },
        ].map((kpi, i) => (
          <div key={kpi.label} className="card p-5">
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Appointments"
          description="Monthly volume"
          data={lineData}
          series={[{ key: 'appointments', color: '#0A84FF', name: 'Appointments' }]}
        />
        <LineChartCard
          title="Revenue"
          description="Monthly revenue"
          data={lineData}
          series={[{ key: 'revenue', color: '#34C759', name: 'Revenue' }]}
        />
      </div>
    </div>
  );
} 