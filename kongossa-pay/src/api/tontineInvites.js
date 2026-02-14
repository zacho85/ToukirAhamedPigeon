// frontend/src/api/tontineInvitesApi.js
import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// --------------------
// Tontine Invites API
// --------------------

/**
 * Get all tontine invites
 */
export const getTontineInvites = async () => {
  try {
    const response = await api.get(`${API_BASE}/tontine-invites`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tontine invites:", error);
    throw error;
  }
};

/**
 * Get a single tontine invite by ID
 * @param {number|string} id
 */
export const getTontineInviteById = async (id) => {
  try {
    const response = await api.get(`${API_BASE}/tontine-invites/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tontine invite ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a tontine invite by ID
 * @param {number|string} id
 */
export const deleteTontineInvite = async (id) => {
  try {
    const response = await api.delete(`${API_BASE}/tontine-invites/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tontine invite ${id}:`, error);
    throw error;
  }
};

/**
 * Accept a tontine invite
 * @param {number|string} id
 */
export const acceptTontineInvite = async (id) => {
  try {
    const response = await api.patch(`${API_BASE}/tontine-invites/${id}/accept`);
    return response.data;
  } catch (error) {
    console.error(`Error accepting tontine invite ${id}:`, error);
    throw error;
  }
};

/**
 * Decline a tontine invite
 * @param {number|string} id
 */
export const declineTontineInvite = async (id) => {
  try {
    const response = await api.patch(`${API_BASE}/tontine-invites/${id}/decline`);
    return response.data;
  } catch (error) {
    console.error(`Error declining tontine invite ${id}:`, error);
    throw error;
  }
};

/**
 * Resend a tontine invite
 * @param {number|string} id
 */
export const resendTontineInvite = async (id) => {
  try {
    const response = await api.post(`${API_BASE}/tontine-invites/${id}/resend`);
    return response.data;
  } catch (error) {
    console.error(`Error resending tontine invite ${id}:`, error);
    throw error;
  }
};

export default {
  getTontineInvites,
  getTontineInviteById,
  deleteTontineInvite,
  acceptTontineInvite,
  declineTontineInvite,
  resendTontineInvite,
};