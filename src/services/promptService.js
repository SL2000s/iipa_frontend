import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";  // FastAPI backend URL  // TODO: don't hardcode

export const submitPrompt = async (prompt, history, kb_label) => {
  try {
    const response = await axios.post(`${API_URL}/submit_prompt/`, {
      prompt: prompt,
      history: history,
      kb_label: kb_label,
    });
    return response.data;
  } catch (error) {
    console.error("Error while sending prompt to API:", error);
    throw error;
  }
};
