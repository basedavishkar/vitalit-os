'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

const menuItems = [
  { name: 'Dashboard', icon: '📊', href: '/dashboard' },
  { name: 'Patients', icon: '👥', href: '/dashboard/patients' },
  { name: 'Doctors', icon: '👨‍⚕️', href: '/dashboard/doctors' },
  { name: 'Appointments', icon: '📅', href: '/dashboard/appointments' },
  { name: 'Medical Records', icon: '📋', href: '/dashboard/records' },
  { name: 'Billing', icon: '💰', href: '/dashboard/billing' },
  { name: 'Inventory', icon: '📦', href: '/dashboard/inventory' },
  { name: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
  { name: 'System', icon: '⚙️', href: '/dashboard/system' },
];

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const currentWidth = isCollapsed ? 80 : 280;

  useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div 
      className="fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out bg-white shadow-lg"
      style={{ 
        width: currentWidth,
        minWidth: currentWidth
      }}
    >
      <div className="h-full w-full border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 bg-blue-600">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-blue-600 font-bold text-lg">V</span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <h1 className="text-white font-bold text-lg">VITALIt</h1>
                    <p className="text-blue-100 text-xs">Healthcare</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.name} className="mb-1">
                  <Link href={item.href} className="block">
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role || 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <span className="text-lg">
                {isCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
