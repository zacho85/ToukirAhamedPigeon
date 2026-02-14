import api from "../lib/axios"; // authenticated axios instance
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Fetch settings
export const getSystemSettings = async () => {
  const res = await api.get("/system-settings");
  return res.data;
};

// Create settings
export const createSystemSettings = async (data) => {
  const res = await api.post("/system-settings", data);
  return res.data;
};

// Update settings
export const updateSystemSettings = async (data) => {
  const res = await api.patch("/system-settings", data);
  return res.data;
};
