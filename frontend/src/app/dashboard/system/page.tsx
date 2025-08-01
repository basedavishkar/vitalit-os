'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileText, 
  HardDrive,
  Activity,
  Settings,
  Database,
  Shield
} from 'lucide-react';

interface Backup {
  filename: string;
  created_at: string;
  size_mb: number;
}

interface SystemStatus {
  database: {
    exists: boolean;
    size_mb: number;
  };
  disk: {
    total_gb: number;
    free_gb: number;
    used_percent: number;
  };
  backups: {
    total_count: number;
    latest_backup: Backup | null;
  };
  version: string;
}

const SystemPage: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'logs'>('overview');

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockBackups: Backup[] = [
        {
          filename: 'vitalit_backup_20241201_143022.zip',
          created_at: '2024-12-01T14:30:22Z',
          size_mb: 45.2
        },
        {
          filename: 'vitalit_backup_20241130_143022.zip',
          created_at: '2024-11-30T14:30:22Z',
          size_mb: 44.8
        },
        {
          filename: 'vitalit_backup_20241129_143022.zip',
          created_at: '2024-11-29T14:30:22Z',
          size_mb: 44.5
        }
      ];

      const mockSystemStatus: SystemStatus = {
        database: {
          exists: true,
          size_mb: 12.5
        },
        disk: {
          total_gb: 500,
          free_gb: 350,
          used_percent: 30
        },
        backups: {
          total_count: 3,
          latest_backup: mockBackups[0]
        },
        version: '1.0.0'
      };

      const mockLogs = [
        '2024-12-01 14:30:22 - INFO - Backup created successfully',
        '2024-12-01 14:25:15 - INFO - User admin logged in',
        '2024-12-01 14:20:08 - WARNING - Low disk space detected',
        '2024-12-01 14:15:42 - INFO - Database backup completed',
        '2024-12-01 14:10:30 - ERROR - Failed to connect to external service'
      ];

      setBackups(mockBackups);
      setSystemStatus(mockSystemStatus);
      setLogs(mockLogs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system data:', error);
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      // In real app, call API to create backup
      console.log('Creating backup...');
      // Refresh data after backup
      await fetchSystemData();
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      // In real app, call API to delete backup
      console.log('Deleting backup:', filename);
      setBackups(backups.filter(b => b.filename !== filename));
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      // In real app, call API to download backup
      console.log('Downloading backup:', filename);
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return;
    }
    
    try {
      // In real app, call API to restore backup
      console.log('Restoring from backup:', filename);
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
  };

  const TabButton: React.FC<{
    id: 'overview' | 'backups' | 'logs';
    icon: React.ReactNode;
    label: string;
  }> = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
        <button
          onClick={fetchSystemData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <TabButton
          id="overview"
          icon={<Activity className="w-4 h-4" />}
          label="Overview"
        />
        <TabButton
          id="backups"
          icon={<Database className="w-4 h-4" />}
          label="Backups"
        />
        <TabButton
          id="logs"
          icon={<FileText className="w-4 h-4" />}
          label="Logs"
        />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemStatus && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Database Status</h3>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size</span>
                  <span className="font-semibold">{systemStatus.database.size_mb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="font-semibold">{systemStatus.version}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Disk Usage</h3>
                <HardDrive className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Space</span>
                  <span className="font-semibold">{systemStatus.disk.total_gb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Space</span>
                  <span className="font-semibold">{systemStatus.disk.free_gb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Used</span>
                  <span className="font-semibold">{systemStatus.disk.used_percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${systemStatus.disk.used_percent}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Backup Status</h3>
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Backups</span>
                  <span className="font-semibold">{systemStatus.backups.total_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latest Backup</span>
                  <span className="font-semibold text-green-600">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-semibold">
                    {systemStatus.backups.latest_backup?.created_at.split('T')[0]}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={createBackup}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Create Backup</span>
              </button>
              <button
                onClick={() => setActiveTab('backups')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Manage Backups</span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Logs</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Backup Management</h2>
            <button
              onClick={createBackup}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Create Backup</span>
            </button>
          </div>

          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Filename</th>
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 font-semibold">Size</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.filename} className="border-b border-gray-100">
                      <td className="py-3 px-4">{backup.filename}</td>
                      <td className="py-3 px-4">
                        {new Date(backup.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{backup.size_mb} MB</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadBackup(backup.filename)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => restoreBackup(backup.filename)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Restore"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.filename)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">System Logs</h2>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="main">Main Log</option>
                <option value="error">Error Log</option>
              </select>
              <button
                onClick={fetchSystemData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <Card className="p-6">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemPage; 