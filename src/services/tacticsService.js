import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";  // FastAPI backend URL  // TODO: don't hardcode

export const getTacticsStatus = async () => {
  const response = await axios.get(`${API_URL}/tactics/`);
  return response.data;
};
