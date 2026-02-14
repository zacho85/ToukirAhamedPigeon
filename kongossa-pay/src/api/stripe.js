// api.js
import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// ------------------------------------------------------------
// Existing API calls remain unchanged
// Example:
// export const getUser = () => api.get(`${API_BASE}/users/me`);
// ------------------------------------------------------------
export const createStripeCheckoutSession = async (data) => {
  // Convert amount to cents
  data.amount = Number(data.amount);
  const res = await api.post(`${API_BASE}/stripe/checkout`, data);
  return res.data; // { url: string, id: string }
};
// --------------------
// Stripe Checkout APIs
// --------------------

/**
 * Call this after successful Stripe checkout
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise} Axios response
 */
export const stripeCheckoutSuccess = (sessionId) => {
  return api.get(`${API_BASE}/stripe/checkout/success`, {
    params: { sessionId },
  });
};

/**
 * Call this if Stripe checkout was canceled
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise} Axios response
 */
export const stripeCheckoutCancel = (sessionId) => {
  return api.get(`${API_BASE}/stripe/checkout/cancel`, {
    params: { sessionId },
  });
};

// ------------------------------------------------------------
// Export other API calls as needed below
// ------------------------------------------------------------

export default {
  stripeCheckoutSuccess,
  stripeCheckoutCancel,
  // ...other API calls
};