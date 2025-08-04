'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedCard } from '@/components/ui/animated-card'
import { GlassCard } from '@/components/ui/glass-card'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ArrowRight,
  Heart,
  Stethoscope,
  CreditCard
} from 'lucide-react'
import { dashboardAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/types/api'
import toast from 'react-hot-toast'

interface RecentActivity {
  id: string
  type: 'appointment' | 'patient' | 'payment' | 'record'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'cancelled'
  amount?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const statCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await dashboardAPI.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Scheduled',
      description: 'Dr. Sarah Johnson - Cardiology consultation',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'patient',
      title: 'New Patient Registered',
      description: 'John Doe - Patient ID: P001234',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      description: 'Consultation fee',
      time: '1 hour ago',
      status: 'completed',
      amount: 250.00
    },
    {
      id: '4',
      type: 'record',
      title: 'Medical Record Updated',
      description: 'Patient: Jane Smith - Follow-up notes',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Appointment Cancelled',
      description: 'Dr. Michael Chen - Neurology',
      time: '3 hours ago',
      status: 'cancelled'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-apple-green/10 text-apple-green border-apple-green/20'
      case 'pending': return 'bg-apple-orange/10 text-apple-orange border-apple-orange/20'
      case 'cancelled': return 'bg-apple-red/10 text-apple-red border-apple-red/20'
      default: return 'bg-apple-gray/10 text-apple-gray border-apple-gray/20'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar
      case 'patient': return Users
      case 'payment': return DollarSign
      case 'record': return Activity
      default: return Clock
    }
  }

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'text-apple-blue'
      case 'patient': return 'text-apple-green'
      case 'payment': return 'text-apple-purple'
      case 'record': return 'text-apple-orange'
      default: return 'text-apple-gray'
    }
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-apple-blue border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-apple-gray text-lg">Loading dashboard...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center lg:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
        >
          Dashboard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600"
        >
          Welcome to your healthcare management dashboard
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={statCardVariants}>
            <GlassCard variant="colored" color="blue" className="p-6 hover:shadow-blue transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Patients</h3>
                <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-apple-blue" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalPatients.toLocaleString()}</div>
              <div className="flex items-center text-sm text-apple-green">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlassCard variant="colored" color="purple" className="p-6 hover:shadow-purple transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Doctors</h3>
                <div className="w-10 h-10 bg-apple-purple/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-apple-purple" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDoctors.toLocaleString()}</div>
              <div className="flex items-center text-sm text-apple-green">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5% from last month
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlassCard variant="colored" color="orange" className="p-6 hover:shadow-orange transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Today&apos;s Appointments</h3>
                <div className="w-10 h-10 bg-apple-orange/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-apple-orange" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.todayAppointments.toLocaleString()}</div>
              <div className="flex items-center text-sm text-apple-red">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3% from yesterday
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlassCard variant="colored" color="green" className="p-6 hover:shadow-green transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Monthly Revenue</h3>
                <div className="w-10 h-10 bg-apple-green/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-apple-green" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="flex items-center text-sm text-apple-green">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18% from last month
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Additional Stats */}
      {stats && (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <AnimatedCard variant="glass" delay={0} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Patients</h3>
                <div className="w-10 h-10 bg-apple-teal/10 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-apple-teal" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activePatients.toLocaleString()}</div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard variant="glass" delay={1} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pending Appointments</h3>
                <div className="w-10 h-10 bg-apple-indigo/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-apple-indigo" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingAppointments.toLocaleString()}</div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard variant="glass" delay={2} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Appointments</h3>
                <div className="w-10 h-10 bg-apple-pink/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-apple-pink" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAppointments.toLocaleString()}</div>
            </AnimatedCard>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="strong" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-600">Latest updates from your healthcare system</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-apple-blue/20 text-apple-blue hover:bg-apple-blue hover:text-white transition-all duration-300">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              const iconColor = getActivityIconColor(activity.type)
              return (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 border border-white/20"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-soft ${iconColor}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-apple-green">{formatCurrency(activity.amount)}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge className={`${getStatusColor(activity.status)} rounded-full px-3 py-1 text-xs font-medium border`}>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <AnimatedCard variant="elevated" className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Common tasks and shortcuts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-apple-blue/20 text-apple-blue hover:bg-apple-blue hover:text-white transition-all duration-300">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Add Patient</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-apple-purple/20 text-apple-purple hover:bg-apple-purple hover:text-white transition-all duration-300">
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm font-medium">Add Doctor</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-apple-orange/20 text-apple-orange hover:bg-apple-orange hover:text-white transition-all duration-300">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Schedule Appointment</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-apple-green/20 text-apple-green hover:bg-apple-green hover:text-white transition-all duration-300">
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-medium">Create Bill</span>
              </Button>
            </motion.div>
          </div>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  )
}
  