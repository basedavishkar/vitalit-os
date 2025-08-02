'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', icon: '🏠', href: '/dashboard' },
  { name: 'Patients', icon: '👥', href: '/dashboard/patients' },
  { name: 'Doctors', icon: '👨‍⚕️', href: '/dashboard/doctors' },
  { name: 'Appointments', icon: '📅', href: '/dashboard/appointments' },
  { name: 'Billing', icon: '💰', href: '/dashboard/billing' },
  { name: 'Records', icon: '📋', href: '/dashboard/records' },
  { name: 'Inventory', icon: '📦', href: '/dashboard/inventory' },
  { name: 'System', icon: '⚙️', href: '/dashboard/system' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div 
      className="relative transition-all duration-300 ease-in-out"
      style={{ width: isCollapsed ? '80px' : '256px' }}
    >
      <div 
        className="fixed left-0 top-0 h-full glass border-r border-white/20 shadow-2xl z-50"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          width: isCollapsed ? '80px' : '256px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div 
            className="p-6 border-b border-white/20"
            style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <div className="flex items-center justify-center">
              <div 
                className="flex items-center space-x-3"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span className="text-white text-lg font-bold">V</span>
                </div>
                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 
                      className="text-xl font-bold gradient-text"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}
                    >
                      VITALIt
                    </h1>
                    <p 
                      className="text-xs text-gray-500"
                      style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}
                    >
                      Healthcare
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2" style={{ padding: '1rem 1rem 1.5rem 1rem' }}>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.name} style={{ marginBottom: '0.5rem' }}>
                  <Link href={item.href} className="block">
                    <div
                      className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        color: isActive ? '#1d4ed8' : '#374151',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' 
                          : 'transparent',
                        border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
                        boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span 
                        className="text-lg mr-3"
                        style={{ 
                          fontSize: '1.125rem', 
                          marginRight: '0.75rem',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* User Profile Section */}
          {!isCollapsed && user && (
            <div 
              className="mt-4 p-3 glass rounded-xl border border-gray-200/30"
              style={{
                margin: '1rem',
                padding: '0.75rem',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(229, 231, 235, 0.3)'
              }}
            >
              <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div 
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p 
                    className="text-sm font-semibold text-gray-900 truncate"
                    style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0
                    }}
                  >
                    {user.username || 'User'}
                  </p>
                  <p 
                    className="text-xs text-gray-500 capitalize truncate"
                    style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0
                    }}
                  >
                    {user.role || 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <div 
            className="p-3 border-t border-white/20"
            style={{ 
              padding: '0.75rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/50 transition-all duration-200"
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>
                {isCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
