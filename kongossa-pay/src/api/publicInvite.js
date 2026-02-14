
// invitationsApi.js
import axios from "axios";
import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// --------------------
// Existing functions remain untouched
// --------------------

// ------------------------------------------------------------
// New Invitation APIs
// ------------------------------------------------------------

/**
 * Get details of a public invite by token (no auth headers)
 * @param {string} token
 * @returns {Promise<any>}
 */
export const getPublicInvite = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/invite/${token}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching public invite:", error);
    throw error;
  }
};

/**
 * Get all invitations for the authenticated user
 * @returns {Promise<any[]>}
 */
export const getInvitations = async () => {
  try {
    const response = await api.get(`${API_BASE}/invitations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
};

// ------------------------------------------------------------
// Export any existing APIs below (if needed)
// ------------------------------------------------------------

export default {
  getPublicInvite,
  getInvitations,
  // ...other existing API functions
};
