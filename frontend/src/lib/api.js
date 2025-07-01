import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // adjust if backend URL changes
});

export const addPatient = async (patientData) => {
  const res = await API.post("/patients", patientData);
  return res.data;
};

export const getPatients = async () => {
  const res = await API.get("/patients");
  return res.data;
};
