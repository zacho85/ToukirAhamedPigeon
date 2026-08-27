import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { RefreshApi } from "@/routes/api";

/* =====================================================
   TOKEN GETTERS (Injected from auth store)
===================================================== */
let getAccessToken: (() => string | null) | null = null;
let getCsrfToken: (() => string | null) | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;

export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter;
};

export const setCsrfTokenGetter = (getter: () => string | null) => {
  getCsrfToken = getter;
};

// Injected from redux/store.ts, same pattern as the getters above -- kept as an
// injected callback rather than a direct `import { store }` here because that
// creates a real circular import (store.ts already imports this file to wire
// setAccessTokenGetter) that crashes at load time under Vite's dev ESM
// evaluation order ("Cannot access 'setAccessTokenGetter' before
// initialization"), not just a theoretical concern -- it reproduced.
export const setTokenRefreshedHandler = (handler: (token: string) => void) => {
  onTokenRefreshed = handler;
};

/* =====================================================
   AXIOS INSTANCE
===================================================== */
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true, // required for refresh cookies
});

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};

    const token = getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   REFRESH TOKEN HANDLING
===================================================== */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

const handleLogout = () => {
  window.dispatchEvent(new Event("logout"));
};

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes(RefreshApi.url)
    ) {
      originalRequest._retry = true;

      // Queue requests while refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const csrfToken = getCsrfToken?.();
        const headers: Record<string, string> = {};
        if (csrfToken) headers["X-CSRF-TOKEN"] = csrfToken;

        const response = await axios.post(
          import.meta.env.VITE_APP_API_URL + RefreshApi.url,
          {},
          { withCredentials: true, headers }
        );

        const newAccessToken = response.data.accessToken;

        if (!newAccessToken) throw new Error("No access token returned");

        processQueue(null, newAccessToken);
        // Push the refreshed token into Redux instead of overwriting the
        // getter with a frozen closure -- the getter wired in redux/store.ts
        // already reads live from the store, so it picks this up
        // automatically. Overwriting it here used to permanently detach
        // axios's token source from Redux after the very first silent
        // refresh: Redux kept showing the pre-refresh token forever
        // (ProtectedRoute/PublicRoute read Redux, not axios), and any later
        // login in the same tab updated Redux but never reached axios, which
        // kept attaching the OLD session's token to every request -- e.g. a
        // freshly registered account's "/auth/me" call would silently still
        // authenticate as whoever was logged in before the refresh.
        onTokenRefreshed?.(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
