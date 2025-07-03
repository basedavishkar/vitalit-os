import axios from "axios";

const API_URL = "http://localhost:8000/patients";

export const createPatient = async (formData: any) => {
  const res = await axios.post("http://localhost:8000/patients", formData); // ✅ JSON by default
  return res.data;
};

export const getPatients = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
