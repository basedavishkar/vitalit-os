'use client';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Patients', value: '1,247', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { title: 'Active Doctors', value: '23', icon: '👨‍⚕️', color: 'from-green-500 to-green-600' },
    { title: "Today's Appointments", value: '89', icon: '📅', color: 'from-purple-500 to-purple-600' },
    { title: 'Monthly Revenue', value: '$45,678', icon: '💰', color: 'from-emerald-500 to-emerald-600' },
  ];

  const appointments = [
    { id: 1, patientName: 'Sarah Johnson', doctorName: 'Dr. Michael Chen', datetime: '2024-01-15 at 10:00 AM', status: 'scheduled' },
    { id: 2, patientName: 'Robert Davis', doctorName: 'Dr. Emily Wilson', datetime: '2024-01-15 at 11:30 AM', status: 'completed' },
    { id: 3, patientName: 'Lisa Thompson', doctorName: 'Dr. James Brown', datetime: '2024-01-15 at 2:00 PM', status: 'scheduled' },
    { id: 4, patientName: 'David Miller', doctorName: 'Dr. Amanda Garcia', datetime: '2024-01-14 at 3:30 PM', status: 'cancelled' },
  ];

  const quickActions = [
    { title: 'Add Patient', icon: '➕', description: 'Quick access to common tasks', href: '/dashboard/patients' },
    { title: 'Schedule Appointment', icon: '📅', description: 'Quick access to common tasks', href: '/dashboard/appointments' },
    { title: 'View Reports', icon: '📊', description: 'Quick access to common tasks', href: '/dashboard/system' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Section */}
      <div className="text-center" style={{ marginBottom: '2rem' }}>
        <h1 className="text-4xl font-bold gradient-text mb-2" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome back, Admin! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening at VITALIt today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="card"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card" style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        marginBottom: '2rem'
      }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Appointments</h2>
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-200"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}
            >
              <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500">{appointment.datetime}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          {quickActions.map((action, index) => (
            <a
              key={action.title}
              href={action.href}
              className="group p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-200 cursor-pointer"
              style={{
                display: 'block',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-200">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
  