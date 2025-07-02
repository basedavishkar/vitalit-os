import React from 'react';
import Link from 'next/link';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">VITALIt-OS</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/patients">Patients</Link>
          <Link href="/doctors">Doctors</Link>
          <Link href="/appointments">Appointments</Link>
          <Link href="/records">Records</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/inventory">Inventory</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 overflow-y-scroll">{children}</main>
    </div>
  );
};

export default DashboardLayout;
