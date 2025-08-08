'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { NotificationSystem } from '@/components/ui/NotificationSystem';
import { cn } from '@/lib/utils';

interface Crumb { label: string; href?: string; }

interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

// Sample notifications for demo
const sampleNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Patient Registration',
    message: 'Sarah Johnson has been successfully registered.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false
  },
  {
    id: '2',
    type: 'info' as const,
    title: 'Appointment Scheduled',
    message: 'New appointment scheduled with Dr. Smith for tomorrow.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Inventory Alert',
    message: 'Low stock alert for medication XR-45.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true
  },
  {
    id: '4',
    type: 'error' as const,
    title: 'System Update',
    message: 'Scheduled maintenance in 30 minutes.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  }
];

export function Header({ title, subtitle, breadcrumbs = [], actions }: HeaderProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="h-16 flex items-center justify-between px-8">
        <div className="min-w-0 flex-1">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              {breadcrumbs.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  <span className={cn(
                    'truncate font-medium',
                    i === breadcrumbs.length - 1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  )}>
                    {c.label}
                  </span>
                </div>
              ))}
            </nav>
          )}
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 truncate mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {actions}
          
          {/* Notification System */}
          <NotificationSystem
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onDismiss={handleDismiss}
          />

          {/* User Menu */}
          {user && (
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setOpen(!open)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="py-1">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 