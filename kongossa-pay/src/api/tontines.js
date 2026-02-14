import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";


export const getTontineTypes = async () => {
  const res = await api.get(`${API_BASE}/tontines/types`);
  return res.data;
};

export const createTontine = async (data) => {
  const res = await api.post(`${API_BASE}/tontines`, data);
  return res.data;
};

export const getTontines = async (params = {}) => {
  const res = await api.get(`${API_BASE}/tontines`, { params });
  return res;
};

export const getTontineById = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}`);
  return res.data;
};

export const updateTontine = async (id, data) => {
  const res = await api.patch(`${API_BASE}/tontines/${id}`, data);
  return res.data;
};

export const deleteTontine = async (id) => {
  const res = await api.delete(`${API_BASE}/tontines/${id}`);
  return res.data;
};

// --------------------
// Additional Tontine API endpoints
// --------------------

export const getTontineCreateForm = async () => {
  const res = await api.get(`${API_BASE}/tontines/create`);
  return res.data;
};

export const getTontineEditForm = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}/edit`);
  return res.data;
};

export const getTontineStats = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}/stats`);
  return res.data;
};

export const getTontineDashboard = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}/dashboard`);
  return res.data;
};

export const addTontineMember = async (id, data) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/members`, data);
  return res.data;
};

export const addTontineInvite = async (id, data) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/invites`, data);
  return res.data;
};

export const approveTontineInvite = async (id, inviteId) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/invites/${inviteId}/approve`);
  return res.data;
};

export const removeTontineMember = async (id, memberId) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/members/${memberId}/remove`);
  return res.data;
};

export const getTontineContributeForm = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}/contribute`);
  return res;
};

export const contributeToTontine = async (id, data, userId) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/contribute/${userId}`, data);
  return res.data;
};

export const payoutTontineMember = async (id, memberId, data) => {
  const res = await api.post(`${API_BASE}/tontines/${id}/payouts/${memberId}`, data);
  return res.data;
};