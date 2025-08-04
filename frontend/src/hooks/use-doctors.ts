import { useState, useEffect, useCallback } from 'react'
import { doctorsAPI } from '@/lib/api'
import { Doctor } from '@/types/api'

interface DoctorsState {
  doctors: Doctor[]
  isLoading: boolean
  error: string | null
  totalCount: number
}

export function useDoctors() {
  const [state, setState] = useState<DoctorsState>({
    doctors: [],
    isLoading: false,
    error: null,
    totalCount: 0
  })

  const fetchDoctors = useCallback(async (params?: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Use development endpoint for now
      const data = await doctorsAPI.getDevDoctors()
      
      setState({
        doctors: data,
        isLoading: false,
        error: null,
        totalCount: data.length
      })
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch doctors'
      }))
    }
  }, [])

  const createDoctor = useCallback(async (doctorData: Omit<Doctor, 'id'>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const newDoctor = await doctorsAPI.create(doctorData)
      
      setState(prev => ({
        ...prev,
        doctors: [...prev.doctors, newDoctor],
        isLoading: false,
        totalCount: prev.totalCount + 1
      }))
      
      return newDoctor
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create doctor'
      }))
      throw error
    }
  }, [])

  const updateDoctor = useCallback(async (id: number, doctorData: Partial<Doctor>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const updatedDoctor = await doctorsAPI.update(id, doctorData)
      
      setState(prev => ({
        ...prev,
        doctors: prev.doctors.map(doctor => 
          doctor.id === id ? updatedDoctor : doctor
        ),
        isLoading: false
      }))
      
      return updatedDoctor
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update doctor'
      }))
      throw error
    }
  }, [])

  const deleteDoctor = useCallback(async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await doctorsAPI.delete(id)
      
      setState(prev => ({
        ...prev,
        doctors: prev.doctors.filter(doctor => doctor.id !== id),
        isLoading: false,
        totalCount: prev.totalCount - 1
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to delete doctor'
      }))
      throw error
    }
  }, [])

  const getDoctorById = useCallback(async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const doctor = await doctorsAPI.getById(id)
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      return doctor
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch doctor'
      }))
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load doctors on mount
  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  return {
    ...state,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorById,
    clearError
  }
} 