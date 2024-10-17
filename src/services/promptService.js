import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";  // FastAPI backend URL  // TODO: don't hardcode

export const submitPrompt = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/submit_prompt/`, {
      prompt: prompt
    });
    return response.data;
  } catch (error) {
    console.error("Error while sending prompt to API:", error);
    throw error;
  }
};
