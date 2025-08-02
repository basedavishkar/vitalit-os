'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

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
      className="fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-out"
      style={{ 
        width: currentWidth,
        minWidth: currentWidth
      }}
    >
      <div 
        className="h-full w-full glass-elevated border-r border-white/10"
        style={{
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Premium Logo Section */}
          <div 
            className="p-4 border-b border-white/10"
            style={{ 
              padding: '1rem', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
            }}
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
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  <span 
                    className="text-white font-bold"
                    style={{ fontSize: '1rem', fontWeight: '800' }}
                  >
                    V
                  </span>
                </div>
                {!isCollapsed && (
                  <div 
                    className="flex flex-col animate-fade-in"
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <h1 
                      className="text-lg font-bold gradient-primary"
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: 0
                      }}
                    >
                      VITALIt
                    </h1>
                    <p 
                      className="text-xs text-neutral-400"
                      style={{ 
                        fontSize: '0.75rem', 
                        color: '#a3a3a3', 
                        margin: 0,
                        fontWeight: '500',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Healthcare
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Navigation Menu */}
          <nav 
            className="flex-1 px-3 py-4 space-y-1"
            style={{ 
              padding: '1rem 0.75rem',
              flex: 1
            }}
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div 
                  key={item.name} 
                  className="animate-slide-in"
                  style={{ 
                    marginBottom: '0.25rem',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
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
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        color: isActive ? 'white' : '#d4d4d4',
                        background: isActive 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                          : 'transparent',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                        boxShadow: isActive ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none',
                        transform: isActive ? 'translateX(8px)' : 'translateX(0)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateX(8px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <span 
                        className="text-base mr-3"
                        style={{ 
                          fontSize: '1rem', 
                          marginRight: '0.75rem',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                        <span 
                          className="truncate font-medium"
                          style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            fontWeight: '500'
                          }}
                        >
                          {item.name}
                        </span>
                      )}
                      {isActive && (
                        <div 
                          className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"
                          style={{
                            marginLeft: 'auto',
                            width: '0.5rem',
                            height: '0.5rem',
                            background: 'white',
                            borderRadius: '50%',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                          }}
                        />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Premium User Profile Section */}
          {!isCollapsed && user && (
            <div 
              className="mx-3 mb-3 animate-fade-in"
              style={{ margin: '0 0.75rem 0.75rem 0.75rem' }}
            >
              <div 
                className="card-elevated p-3"
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div 
                  className="flex items-center space-x-3"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <div 
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
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
                      fontSize: '0.875rem',
                      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p 
                      className="text-sm font-semibold text-white truncate"
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }}
                    >
                      {user.username || 'User'}
                    </p>
                    <p 
                      className="text-xs text-neutral-300 capitalize truncate"
                      style={{
                        fontSize: '0.75rem',
                        color: '#d4d4d4',
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
            </div>
          )}

          {/* Premium Collapse Button */}
          <div 
            className="p-3 border-t border-white/10"
            style={{ 
              padding: '0.75rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn-ghost p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#d4d4d4'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#d4d4d4';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span 
                style={{ 
                  fontSize: '1rem',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
