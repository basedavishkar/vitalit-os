import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock useAuth hook
const mockLogin = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false
  })
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockClear()
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('VITALIt')).toBeInTheDocument()
    expect(screen.getByText('Healthcare Management System')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should display demo credentials', () => {
    render(<LoginPage />)

    expect(screen.getByText('Demo Credentials')).toBeInTheDocument()
    expect(screen.getByText('Username: admin')).toBeInTheDocument()
    expect(screen.getByText('Password: admin123')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    mockLogin.mockResolvedValue(true)

    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123')
    })
  })

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should have proper form accessibility', () => {
    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(usernameInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('should have proper styling classes', () => {
    render(<LoginPage />)

    const form = screen.getByRole('form')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    expect(form).toHaveClass('space-y-6')
    expect(submitButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')
  })
}) 