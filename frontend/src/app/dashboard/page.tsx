'use client';

import { Card } from '@/components/ui/Card';

const stats = [
  {
    title: 'Total Patients',
    value: '1,247',
    change: '+12%',
    changeType: 'positive',
    icon: '👥',
    color: 'from-blue-500 to-blue-600',
    description: 'Active patients in system'
  },
  {
    title: 'Active Doctors',
    value: '23',
    change: '+3%',
    changeType: 'positive',
    icon: '👨‍⚕️',
    color: 'from-green-500 to-green-600',
    description: 'Available medical staff'
  },
  {
    title: "Today's Appointments",
    value: '89',
    change: '+8%',
    changeType: 'positive',
    icon: '📅',
    color: 'from-purple-500 to-purple-600',
    description: 'Scheduled for today'
  },
  {
    title: 'Monthly Revenue',
    value: '$45,678',
    change: '+15%',
    changeType: 'positive',
    icon: '💰',
    color: 'from-yellow-500 to-yellow-600',
    description: 'This month\'s earnings'
  }
];

const appointments = [
  {
    id: 1,
    patientName: 'Sarah Johnson',
    doctorName: 'Dr. Michael Chen',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'General Checkup'
  },
  {
    id: 2,
    patientName: 'Robert Davis',
    doctorName: 'Dr. Emily Wilson',
    date: '2024-01-15',
    time: '11:30 AM',
    status: 'completed',
    type: 'Cardiology'
  },
  {
    id: 3,
    patientName: 'Lisa Thompson',
    doctorName: 'Dr. James Brown',
    date: '2024-01-15',
    time: '2:00 PM',
    status: 'scheduled',
    type: 'Dermatology'
  },
  {
    id: 4,
    patientName: 'David Miller',
    doctorName: 'Dr. Amanda Garcia',
    date: '2024-01-14',
    time: '3:30 PM',
    status: 'cancelled',
    type: 'Orthopedics'
  }
];

const quickActions = [
  {
    title: 'Add Patient',
    description: 'Register new patient',
    icon: '➕',
    href: '/dashboard/patients',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Schedule Appointment',
    description: 'Book new appointment',
    icon: '📅',
    href: '/dashboard/appointments',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'View Reports',
    description: 'Analytics & insights',
    icon: '📊',
    href: '/dashboard/system',
    color: 'from-purple-500 to-purple-600'
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="headline-1 gradient-primary">
          Welcome back, Admin! 👋
        </h1>
        <p className="body-large text-neutral-300 max-w-2xl mx-auto">
          Here's what's happening at VITALIt today. Your healthcare system is running smoothly with excellent patient care metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="card-elevated group"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="caption text-neutral-400 mb-2">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="headline-2 text-white">{stat.value}</p>
                  <span 
                    className={`text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="body-small text-neutral-400 mt-2">{stat.description}</p>
              </div>
              <div 
                className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-6">
              <h2 className="headline-3 text-white">Recent Appointments</h2>
              <button className="btn-ghost text-sm">View All</button>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300 group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg"
                      style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {appointment.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{appointment.patientName}</p>
                      <p className="text-sm text-neutral-400">{appointment.doctorName}</p>
                      <p className="text-xs text-neutral-500">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">
                      {appointment.date} at {appointment.time}
                    </p>
                    <span 
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        appointment.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="card-elevated">
            <h2 className="headline-3 text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <a
                  key={action.title}
                  href={action.href}
                  className="block group"
                  style={{ textDecoration: 'none' }}
                >
                  <div 
                    className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300 group-hover:scale-105"
                    style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.25rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {action.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{action.title}</p>
                        <p className="text-sm text-neutral-400">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card-elevated">
        <h2 className="headline-3 text-white mb-6">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">✅</span>
            </div>
            <p className="font-semibold text-green-400">Database</p>
            <p className="text-sm text-neutral-400">Healthy</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">⚡</span>
            </div>
            <p className="font-semibold text-blue-400">API</p>
            <p className="text-sm text-neutral-400">Online</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🔒</span>
            </div>
            <p className="font-semibold text-purple-400">Security</p>
            <p className="text-sm text-neutral-400">Protected</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">📊</span>
            </div>
            <p className="font-semibold text-yellow-400">Analytics</p>
            <p className="text-sm text-neutral-400">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
  