import api from "@/lib/axios";


export const getProfile = async () => {
  const res = await api.get(`/settings/profile`);
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.patch(`/settings/profile`, data);
  return res.data;
};

export const deleteProfile = async () => {
  const res = await api.delete(`/settings/profile`);
  return res.data;
};

export const getPassword = async () => {
  const res = await api.get(`/settings/password`);
  return res.data;
};

export const updatePassword = async (data: any) => {
  const res = await api.put(`/settings/password`, data);
  return res.data;
};

export const getAppearanceSettings = async () => {
  const res = await api.get(`/settings/appearance`);
  return res.data;
};

export const uploadFile = async (formData: FormData) => {
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // returns { path: "/uploads/profile/filename.png" }
};
