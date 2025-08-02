'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Patients', href: '/dashboard/patients', icon: '👥' },
  { name: 'Doctors', href: '/dashboard/doctors', icon: '👨‍⚕️' },
  { name: 'Appointments', href: '/dashboard/appointments', icon: '📅' },
  { name: 'Billing', href: '/dashboard/billing', icon: '💰' },
  { name: 'Records', href: '/dashboard/records', icon: '📋' },
  { name: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
  { name: 'System', href: '/dashboard/system', icon: '⚙️' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className={`relative transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Glassmorphism sidebar */}
      <div className="fixed left-0 top-0 h-full backdrop-blur-xl bg-white/70 border-r border-white/20 shadow-2xl z-50">
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-center">
              {isCollapsed ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">V</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">V</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      VITALIt
                    </h1>
                    <p className="text-xs text-gray-500">Healthcare</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 border border-blue-200/50 shadow-sm'
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-3 rounded-xl text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all duration-200"
            >
              <span className="text-lg">
                {isCollapsed ? '→' : '←'}
              </span>
              {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
            </button>
            
            <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              {!isCollapsed && <span className="ml-2 text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
