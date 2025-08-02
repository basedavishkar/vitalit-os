import { createAuthenticatedApiClient } from '@/lib/auth';
import { Patient } from '@/types';

const apiClient = createAuthenticatedApiClient();

export const createPatient = async (formData: Omit<Patient, 'id'>) => {
  const res = await apiClient.post('/patients/', formData);
  return res.data;
};

export const getPatients = async () => {
  const res = await apiClient.get('/patients/');
  return res.data;
};
