import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

/* =====================================================
   TOKEN GETTERS (Injected from redux/store.ts)
   Kept as injected callbacks rather than a direct `import { store }` here --
   store.ts already imports this file to wire the getter, so a static import
   back would create a circular dependency that crashes at load time under
   Vite's dev ESM evaluation order. See kongossa-pay-ts/src/lib/axios.ts for
   the incident this pattern was adopted from.
===================================================== */
let getAccessToken: (() => string | null) | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;

export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter;
};

export const setTokenRefreshedHandler = (handler: (token: string) => void) => {
  onTokenRefreshed = handler;
};

const REFRESH_URL = "/auth/refresh-token";

/* =====================================================
   AXIOS INSTANCE
===================================================== */
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true, // required for the refresh cookie
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
  (error) => Promise.reject(error),
);

/* =====================================================
   REFRESH TOKEN HANDLING
===================================================== */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
    const originalRequest: (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined =
      error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(REFRESH_URL)
    ) {
      originalRequest._retry = true;

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
        const response = await axios.post(
          import.meta.env.VITE_APP_API_URL + REFRESH_URL,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.accessToken;
        if (!newAccessToken) throw new Error("No access token returned");

        processQueue(null, newAccessToken);
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
  },
);

export default api;
