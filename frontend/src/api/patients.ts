import axios from "axios";

const API_URL = "http://localhost:8000/patients";

export const createPatient = async (formData: any) => {
  const res = await axios.post(API_URL, formData);
  return res.data;
};

export const getPatients = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
