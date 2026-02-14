// frontend/src/api/tontineInvitesApi.js
import api from "@/lib/axios";


// --------------------
// Tontine Invites API
// --------------------

/**
 * Get all tontine invites
 */
export const getTontineInvites = async () => {
  try {
    const response = await api.get(`/tontine-invites`);
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
export const getTontineInviteById = async (id: number | string) => {
  try {
    const response = await api.get(`/tontine-invites/${id}`);
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
export const deleteTontineInvite = async (id: number | string) => {
  try {
    const response = await api.delete(`/tontine-invites/${id}`);
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
export const acceptTontineInvite = async (id: number | string) => {
  try {
    const response = await api.patch(`/tontine-invites/${id}/accept`);
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
export const declineTontineInvite = async (id: number | string) => {
  try {
    const response = await api.patch(`/tontine-invites/${id}/decline`);
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
export const resendTontineInvite = async (id: number | string) => {
  try {
    const response = await api.post(`/tontine-invites/${id}/resend`);
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