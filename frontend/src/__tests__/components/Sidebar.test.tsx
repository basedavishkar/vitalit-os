import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/dashboard/Sidebar'

// Mock useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'admin', role: 'admin' },
    logout: jest.fn()
  })
}))

describe('Sidebar', () => {
  it('should render sidebar with all navigation items', () => {
    render(<Sidebar />)

    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Doctors')).toBeInTheDocument()
    expect(screen.getByText('Appointments')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Records')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should render logo and brand name', () => {
    render(<Sidebar />)

    expect(screen.getByText('VITALIt')).toBeInTheDocument()
    expect(screen.getByText('Healthcare')).toBeInTheDocument()
  })

  it('should render user profile section', () => {
    render(<Sidebar />)

    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument() // role
  })

  it('should have collapse and logout buttons', () => {
    render(<Sidebar />)

    expect(screen.getByText('Collapse')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should have proper navigation links', () => {
    render(<Sidebar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const patientsLink = screen.getByText('Patients').closest('a')
    const doctorsLink = screen.getByText('Doctors').closest('a')

    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(patientsLink).toHaveAttribute('href', '/dashboard/patients')
    expect(doctorsLink).toHaveAttribute('href', '/dashboard/doctors')
  })

  it('should have proper icons for each menu item', () => {
    render(<Sidebar />)

    // Check for emoji icons
    expect(screen.getByText('🏠')).toBeInTheDocument() // Dashboard
    expect(screen.getByText('👥')).toBeInTheDocument() // Patients
    expect(screen.getByText('👨‍⚕️')).toBeInTheDocument() // Doctors
    expect(screen.getByText('📅')).toBeInTheDocument() // Appointments
    expect(screen.getByText('💰')).toBeInTheDocument() // Billing
    expect(screen.getByText('📋')).toBeInTheDocument() // Records
    expect(screen.getByText('📦')).toBeInTheDocument() // Inventory
    expect(screen.getByText('⚙️')).toBeInTheDocument() // System
  })
}) 