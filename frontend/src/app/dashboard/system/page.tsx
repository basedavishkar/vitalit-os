'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function SystemPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'settings'>('system');

  const systemStatus = [
    { name: 'Database', status: 'online', color: 'green' },
    { name: 'API Server', status: 'healthy', color: 'green' },
    { name: 'Storage', status: '75% used', color: 'yellow' },
    { name: 'Backup', status: '2h ago', color: 'green' },
    { name: 'Response Time', status: '45ms', color: 'green' },
    { name: 'Uptime', status: '99.9%', color: 'green' }
  ];

  const performanceMetrics = [
    { name: 'Active Sessions', value: '1,247', change: '+12%' },
    { name: 'Data Sync', value: 'Real-time', change: '✓' },
    { name: 'Memory Usage', value: '68%', change: '-5%' },
    { name: 'CPU Load', value: '42%', change: '+3%' }
  ];

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">System & Settings</h1>
        <p className="text-lg text-gray-600">
          Manage system configuration and user preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'system' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('system')}
          className="rounded-md"
        >
          System Status
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
          className="rounded-md"
        >
          User Settings
        </Button>
      </div>

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">System Status</CardTitle>
              <CardDescription className="text-gray-600">
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {systemStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        item.color === 'green' ? 'bg-green-500' : 
                        item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      )}></div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      item.color === 'green' ? 'text-green-600' : 
                      item.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Performance Metrics</CardTitle>
              <CardDescription className="text-gray-600">
                Real-time performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                      <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">System Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Administrative system operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh System Cache
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Backup Database
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run System Diagnostics
                </Button>
                <Button variant="outline" className="justify-start text-yellow-600 hover:text-yellow-700">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  View System Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Settings */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Profile Settings</CardTitle>
              <CardDescription className="text-gray-600">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <Input
                    type="text"
                    value={user?.username || ''}
                    className="w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    className="w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <Input
                    type="text"
                    value={user?.role || ''}
                    className="w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your display name"
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Security Settings</CardTitle>
              <CardDescription className="text-gray-600">
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Preferences</CardTitle>
              <CardDescription className="text-gray-600">
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Data Management</CardTitle>
              <CardDescription className="text-gray-600">
                Manage your data and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export My Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 