import axios from "axios";
import { Appointment } from '@/types';

const API_URL = "http://localhost:8000/appointments";

export const createAppointment = async (data: Omit<Appointment, 'id'>) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getAppointments = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
