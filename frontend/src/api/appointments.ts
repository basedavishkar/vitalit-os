import axios from "axios";
const API_URL = "http://localhost:8000/appointments";

export const createAppointment = async (data: any) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getAppointments = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
