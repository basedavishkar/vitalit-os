import { createAuthenticatedApiClient } from '@/lib/auth';
import { Doctor } from '@/types';

const apiClient = createAuthenticatedApiClient();

export const createDoctor = async (formData: Omit<Doctor, 'id'>) => {
  const res = await apiClient.post('/doctors/', formData);
  return res.data;
};

export const getDoctors = async () => {
  const res = await apiClient.get('/doctors/');
  return res.data;
};
