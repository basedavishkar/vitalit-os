import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { User } from '@/types/api'
import { ROUTES } from '@/lib/constants'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user_data')
      
      if (!token || !userData) {
        setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }))
        localStorage.clear() // Clear any partial auth state
        return
      }

      try {
        // Verify token is still valid with backend
        const user = await authAPI.getCurrentUser()
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } catch (error) {
        // Token is invalid or expired
        console.error('Auth validation failed:', error)
        localStorage.clear()
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed'
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.clear()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed'
      })
    }
  }, [])

  // Check if user is authenticated on mount
  // FIX: Ensure checkAuth is memoized with useCallback. Only run when hasCheckedAuth or checkAuth changes.
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth()
      setHasCheckedAuth(true)
    }
  }, [hasCheckedAuth, checkAuth])

  const login = useCallback(async (username: string, password: string) => {
    try {
      console.log('Login attempt:', { username, password });
      
      // Clear any existing auth state before attempting login
      localStorage.clear()
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await authAPI.login({ username, password })
      console.log('Login response:', response);
      
      if (!response?.access_token || !response?.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login response')
      }
      
      // Store token and user data
      localStorage.setItem('access_token', response.access_token)
      setUser(response.user)
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      return response
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear any partial auth state on error
      localStorage.clear()
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token')
      setUser(null)
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      
      router.replace(ROUTES.LOGIN)
    }
  }, [router])

  const setUser = useCallback((user: User | null) => {
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user))
    } else {
      localStorage.removeItem('user_data')
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  // Memoize returned object to avoid causing infinite loops in consumers
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    checkAuth,
    clearError
  }
} 