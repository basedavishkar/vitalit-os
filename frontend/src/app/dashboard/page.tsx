'use client';

import { motion } from 'framer-motion';

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome back, Admin! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening at VITALIt today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Appointments</h2>
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500">{appointment.datetime}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
            className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                {action.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
  