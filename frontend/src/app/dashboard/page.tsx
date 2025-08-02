'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  revenue: number;
}

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const StatCard = ({ title, value, icon, color, delay }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    className={`p-6 rounded-2xl backdrop-blur-xl bg-white/70 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <motion.p 
          className="text-sm font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1, duration: 0.4 }}
        >
          {title}
        </motion.p>
        <motion.p 
          className="text-2xl font-bold text-gray-900 mt-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
        >
          {value}
        </motion.p>
      </div>
      <motion.div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.6, type: "spring" }}
        whileHover={{ rotate: 360, scale: 1.1 }}
      >
        {icon}
      </motion.div>
    </div>
  </motion.div>
);

const AppointmentCard = ({ appointment, index }: { appointment: Appointment; index: number }) => {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      className="p-4 rounded-xl backdrop-blur-xl bg-white/70 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.p 
            className="font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
          >
            {appointment.patientName}
          </motion.p>
          <motion.p 
            className="text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
          >
            Dr. {appointment.doctorName}
          </motion.p>
          <motion.p 
            className="text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
          >
            {appointment.date} at {appointment.time}
          </motion.p>
        </div>
        <motion.span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.3, type: "spring" }}
        >
          {appointment.status}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalPatients: 1247,
        totalDoctors: 23,
        totalAppointments: 89,
        revenue: 45678
      });
      setRecentAppointments([
        {
          id: 1,
          patientName: "Sarah Johnson",
          doctorName: "Dr. Michael Chen",
          date: "2024-01-15",
          time: "10:00 AM",
          status: "scheduled"
        },
        {
          id: 2,
          patientName: "Robert Davis",
          doctorName: "Dr. Emily Wilson",
          date: "2024-01-15",
          time: "11:30 AM",
          status: "completed"
        },
        {
          id: 3,
          patientName: "Lisa Thompson",
          doctorName: "Dr. James Brown",
          date: "2024-01-15",
          time: "2:00 PM",
          status: "scheduled"
        },
        {
          id: 4,
          patientName: "David Miller",
          doctorName: "Dr. Amanda Garcia",
          date: "2024-01-14",
          time: "3:30 PM",
          status: "cancelled"
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Welcome back, Admin! 👋
        </motion.h1>
        <motion.p 
          className="text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Here's what's happening at VITALIt today
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon="👥"
          color="hover:bg-blue-50/50"
          delay={0.5}
        />
        <StatCard
          title="Active Doctors"
          value={stats.totalDoctors}
          icon="👨‍⚕️"
          color="hover:bg-green-50/50"
          delay={0.6}
        />
        <StatCard
          title="Today's Appointments"
          value={stats.totalAppointments}
          icon="📅"
          color="hover:bg-purple-50/50"
          delay={0.7}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon="💰"
          color="hover:bg-yellow-50/50"
          delay={0.8}
        />
      </motion.div>

      {/* Recent Appointments */}
      <motion.div
        className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        whileHover={{ 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
      >
        <motion.h2 
          className="text-xl font-semibold text-gray-900 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          Recent Appointments
        </motion.h2>
        <div className="space-y-3">
          <AnimatePresence>
            {recentAppointments.map((appointment, index) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        {[
          { title: "Add Patient", icon: "➕", color: "bg-blue-500", href: "/dashboard/patients" },
          { title: "Schedule Appointment", icon: "📅", color: "bg-green-500", href: "/dashboard/appointments" },
          { title: "View Reports", icon: "📊", color: "bg-purple-500", href: "/dashboard/analytics" }
        ].map((action, index) => (
          <motion.button
            key={action.title}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/70 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-4 ${action.color}`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {action.icon}
            </motion.div>
            <motion.h3 
              className="font-semibold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
            >
              {action.title}
            </motion.h3>
            <motion.p 
              className="text-sm text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
            >
              Quick access to common tasks
            </motion.p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
  