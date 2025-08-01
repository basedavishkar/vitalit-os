import React from 'react';
import DashboardStats from '../../components/dashboard/DashboardStats';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <DashboardStats />
    </div>
  );
}
  