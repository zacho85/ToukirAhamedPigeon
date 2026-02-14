import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createUser = async (formData) => {
  // ✅ Do NOT spread formData — send it directly
  const res = await api.post(`${API_BASE}/users`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getUsers = async (params = {}) => {
  // Example: { search: 'john', page: 1, per_page: 10 }
  const res = await api.get(`${API_BASE}/users`, { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`${API_BASE}/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  // Create a copy and remove password_confirmation
  const payload = { ...data };
  delete payload.password_confirmation;

  const res = await api.put(`${API_BASE}/users/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`${API_BASE}/users/${id}`);
  return res.data;
};

export const downloadUserDocument = async (user) => {
  try {
    const res = await api.get(`${API_BASE}/users/${user.id}/download-document`, {
      responseType: 'blob', // important!
    });

    // Get file extension from the server-provided path
    const fileExt = user.legalFormDocument.split('.').pop() || 'pdf';

    // Create dynamic filename
    const fileName = `${user.fullName.replace(/\s+/g, '_')}_legal_form.${fileExt}`;

    // Create a blob URL
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // clean up
  } catch (err) {
    console.error('Failed to download document', err);
  }
};
