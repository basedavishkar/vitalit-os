import axios from "axios";
import { Patient } from '@/types';

const API_URL = "http://localhost:8000/patients";

export const createPatient = async (formData: Omit<Patient, 'id'>) => {
  const res = await axios.post(API_URL, formData);
  return res.data;
};

export const getPatients = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
