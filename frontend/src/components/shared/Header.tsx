'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span className="text-gray-600 font-medium">Healthcare Management</span>
        </div>

        {/* Right side - User profile and actions */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            + New Patient
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
