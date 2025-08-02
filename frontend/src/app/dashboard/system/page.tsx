'use client';

export default function SystemPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-primary">
            System Management
          </h1>
          <p className="text-sm text-neutral-300 mt-1">Monitor system health and settings</p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm">Settings</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-elevated p-4">
          <h2 className="text-lg font-bold text-white mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✅</span>
                </div>
                <span className="text-sm font-medium text-white">Database</span>
              </div>
              <span className="text-xs text-green-400">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <span className="text-sm font-medium text-white">API Server</span>
              </div>
              <span className="text-xs text-blue-400">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔒</span>
                </div>
                <span className="text-sm font-medium text-white">Security</span>
              </div>
              <span className="text-xs text-purple-400">Protected</span>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <h2 className="text-lg font-bold text-white mb-4">Performance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">CPU Usage</span>
              <span className="text-sm text-white">23%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Memory Usage</span>
              <span className="text-sm text-white">67%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Disk Usage</span>
              <span className="text-sm text-white">45%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 