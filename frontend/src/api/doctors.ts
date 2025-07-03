import axios from "axios";

const API_URL = "http://localhost:8000/doctors";

/** POST /doctors */
export const createDoctor = async (data: any) => {
  const res = await axios.post(API_URL, data);   // if data is plain object ⇒ JSON
  return res.data;
};


/** GET /doctors */
export const getDoctors = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
