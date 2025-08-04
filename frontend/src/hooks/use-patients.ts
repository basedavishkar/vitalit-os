import { useState, useEffect, useCallback } from 'react'
import { patientsAPI } from '@/lib/api'
import { Patient, PatientSearchParams } from '@/types/api'

interface PatientsState {
  patients: Patient[]
  isLoading: boolean
  error: string | null
  totalCount: number
}

export function usePatients() {
  const [state, setState] = useState<PatientsState>({
    patients: [],
    isLoading: false,
    error: null,
    totalCount: 0
  })

  const fetchPatients = useCallback(async (params?: PatientSearchParams) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Use development endpoint for now
      const data = await patientsAPI.getDevPatients()
      
      setState({
        patients: data,
        isLoading: false,
        error: null,
        totalCount: data.length
      })
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch patients'
      }))
    }
  }, [])

  const createPatient = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const newPatient = await patientsAPI.create(patientData)
      
      setState(prev => ({
        ...prev,
        patients: [...prev.patients, newPatient],
        isLoading: false,
        totalCount: prev.totalCount + 1
      }))
      
      return newPatient
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create patient'
      }))
      throw error
    }
  }, [])

  const updatePatient = useCallback(async (id: number, patientData: Partial<Patient>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const updatedPatient = await patientsAPI.update(id, patientData)
      
      setState(prev => ({
        ...prev,
        patients: prev.patients.map(patient => 
          patient.id === id ? updatedPatient : patient
        ),
        isLoading: false
      }))
      
      return updatedPatient
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update patient'
      }))
      throw error
    }
  }, [])

  const deletePatient = useCallback(async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await patientsAPI.delete(id)
      
      setState(prev => ({
        ...prev,
        patients: prev.patients.filter(patient => patient.id !== id),
        isLoading: false,
        totalCount: prev.totalCount - 1
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to delete patient'
      }))
      throw error
    }
  }, [])

  const getPatientById = useCallback(async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const patient = await patientsAPI.getById(id)
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      return patient
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch patient'
      }))
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load patients on mount
  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return {
    ...state,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    clearError
  }
} 