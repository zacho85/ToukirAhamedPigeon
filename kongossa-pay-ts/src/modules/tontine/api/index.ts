import api from "@/lib/axios";


export const getTontineTypes = async () => {
  const res = await api.get(`/tontines/types`);
  return res.data;
};

export const createTontine = async (data: any) => {
  const res = await api.post(`/tontines`, data);
  return res.data;
};

export const getTontines = async (params = {}) => {
  const res = await api.get(`/tontines`, { params });
  return res;
};

export const getTontineById = async (id: number | string) => {
  const res = await api.get(`/tontines/${id}`);
  return res.data;
};

export const updateTontine = async (id: number | string, data: any) => {
  const res = await api.patch(`/tontines/${id}`, data);
  return res.data;
};

export const deleteTontine = async (id: number | string) => {
  const res = await api.delete(`/tontines/${id}`);
  return res.data;
};

// --------------------
// Additional Tontine API endpoints
// --------------------

export const getTontineCreateForm = async () => {
  const res = await api.get(`/tontines/create`);
  return res.data;
};

export const getTontineEditForm = async (id: number | string) => {
  const res = await api.get(`/tontines/${id}/edit`);
  return res.data;
};

export const getTontineStats = async (id: number | string) => {
  const res = await api.get(`/tontines/${id}/stats`);
  return res.data;
};

export const getTontineDashboard = async (id: number | string) => {
  const res = await api.get(`/tontines/${id}/dashboard`);
  return res.data;
};

export const addTontineMember = async (id: number | string, data: any) => {
  const res = await api.post(`/tontines/${id}/members`, data);
  return res.data;
};

export const addTontineInvite = async (id: number | string, data: any) => {
  const res = await api.post(`/tontines/${id}/invites`, data);
  return res.data;
};

export const approveTontineInvite = async (id: number | string, inviteId: number | string) => {
  const res = await api.post(`/tontines/${id}/invites/${inviteId}/approve`);
  return res.data;
};

export const removeTontineMember = async (id: number | string, memberId: number | string) => {
  const res = await api.post(`/tontines/${id}/members/${memberId}/remove`);
  return res.data;
};

export const getTontineContributeForm = async (id: number | string) => {
  const res = await api.get(`/tontines/${id}/contribute`);
  return res;
};

export const contributeToTontine = async (id: number | string, data: any, userId: number | string) => {
  const res = await api.post(`/tontines/${id}/contribute/${userId}`, data);
  return res.data;
};

export const payoutTontineMember = async (id: number | string, memberId: number | string, data: any) => {
  const res = await api.post(`/tontines/${id}/payouts/${memberId}`, data);
  return res.data;
};