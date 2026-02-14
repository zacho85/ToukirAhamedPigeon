import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const uploadFile = async (file, type = "others") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await api.post(`${API_BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
