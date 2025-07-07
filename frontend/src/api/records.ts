import axios from "axios";

const API_URL = "http://localhost:8000/records";

export const createRecord = async (data: any) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const getRecords = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getRecordsByPatient = async (patientId: number) => {
  const res = await axios.get(`${API_URL}/${patientId}`);
  return res.data;
};

export const deleteRecord = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 