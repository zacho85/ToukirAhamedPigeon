// api.js
import api from "@/lib/axios";

// ------------------------------------------------------------
// Existing API calls remain unchanged
// Example:
// export const getUser = () => api.get(`${API_BASE}/users/me`);
// ------------------------------------------------------------
export const createStripeCheckoutSession = async (data: any) => {
  // Convert amount to cents
  data.amount = Number(data.amount);
  const res = await api.post(`/stripe/checkout`, data);
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
export const stripeCheckoutSuccess = async (sessionId: string) => {
  return await api.get(`/tontine-contributions/checkout/success`, {
    params: { sessionId },
  });
};

/**
 * Call this if Stripe checkout was canceled
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise} Axios response
 */
export const stripeCheckoutCancel = async (sessionId: string) => {
  return await api.get(`/tontine-contributions/checkout/cancel`, {
    params: { sessionId },
  });
};

// ------------------------------------------------------------
// Export other API calls as needed below
// ------------------------------------------------------------

export default {
  stripeCheckoutSuccess,
  stripeCheckoutCancel
};