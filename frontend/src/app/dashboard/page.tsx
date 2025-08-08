'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { formatCurrency } from '@/lib/utils'
import { dashboardAPI } from '@/lib/api'
import { DashboardStats } from '@/types/api'

interface RecentActivity {
  id: string
  type: 'appointment' | 'patient' | 'payment' | 'record'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'cancelled'
  amount?: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    activePatients: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  // FIX: Only run on mount, no dependencies needed.
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Generate recent activity based on stats - memoized for performance
  const recentActivity = useMemo((): RecentActivity[] => {
    return [
      {
        id: '1',
        type: 'appointment',
        title: 'New Appointment Scheduled',
        description: `Today's appointments: ${stats.todayAppointments}`,
        time: '2 minutes ago',
        status: 'pending'
      },
      {
        id: '2',
        type: 'patient',
        title: 'New Patient Registered',
        description: `Total patients: ${stats.totalPatients}`,
        time: '15 minutes ago',
        status: 'completed'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Received',
        description: `Monthly revenue: ${formatCurrency(stats.monthlyRevenue)}`,
        time: '1 hour ago',
        status: 'completed',
        amount: stats.monthlyRevenue / 100
      },
      {
        id: '4',
        type: 'record',
        title: 'Medical Record Updated',
        description: `Active patients: ${stats.activePatients}`,
        time: '2 hours ago',
        status: 'completed'
      },
      {
        id: '5',
        type: 'appointment',
        title: 'Appointment Status Update',
        description: `Pending appointments: ${stats.pendingAppointments}`,
        time: '3 hours ago',
        status: 'pending'
      }
    ]
  }, [stats])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      case 'appointment': return 'text-blue-600'
      case 'patient': return 'text-green-600'
      case 'payment': return 'text-purple-600'
      case 'record': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-6 pt-2 pb-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
          Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Welcome to your healthcare management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Patients</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalPatients.toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{Math.round(stats.totalPatients / 10)}% from last month
            </div>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Doctors</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDoctors.toLocaleString()}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{Math.round(stats.totalDoctors / 3)}% from last month
            </div>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Today&apos;s Appointments</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.todayAppointments.toLocaleString()}</div>
            <div className="flex items-center text-sm text-red-600">
              <TrendingDown className="w-4 h-4 mr-1" />
              -{Math.round(stats.todayAppointments / 2)}% from yesterday
            </div>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Monthly Revenue</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{Math.round(stats.monthlyRevenue / 1000)}% from last month
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Patients</h3>
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.activePatients.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pending Appointments</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingAppointments.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Appointments</h3>
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAppointments.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="p-6 bg-white/90 shadow-lg rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-600">Latest updates from your healthcare system</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              const iconColor = getActivityIconColor(activity.type)
              return (
                <div 
                  key={activity.id}
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
                      <p className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge className={`${getStatusColor(activity.status)} rounded-full px-3 py-1 text-xs font-medium border`}>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Common tasks and shortcuts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Add Patient</span>
              </Button>
            </div>
            
            <div>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300">
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm font-medium">Add Doctor</span>
              </Button>
            </div>
            
            <div>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Schedule Appointment</span>
              </Button>
            </div>
            
            <div>
              <Button variant="outline" className="h-24 w-full flex-col space-y-3 rounded-xl border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300">
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-medium">Create Bill</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  