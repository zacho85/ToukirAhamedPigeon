import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createSavedContact = async (data) => {
  const res = await api.post(`${API_BASE}/saved-contacts`, data);
  return res.data;
};

export const getSavedContacts = async (filters = {}) => {
  const res = await api.get(`${API_BASE}/saved-contacts`, { params: filters });
  return res.data;
};

export const getSavedContactById = async (id) => {
  const res = await api.get(`${API_BASE}/saved-contacts/${id}`);
  return res.data;
};

export const updateSavedContact = async (id, data) => {
  const res = await api.patch(`${API_BASE}/saved-contacts/${id}`, data);
  return res.data;
};

export const deleteSavedContact = async (id) => {
  const res = await api.delete(`${API_BASE}/saved-contacts/${id}`);
  return res.data;
};
