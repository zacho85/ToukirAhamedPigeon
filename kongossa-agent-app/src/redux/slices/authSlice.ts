import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_API_URL;
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// The agent's own AgentProfile, attached alongside the base user info the
// login response returns. kycStatus/status drive which screen the app shows
// (pending approval vs. the real dashboard) -- see App.tsx's routing guard.
export interface AgentProfile {
  id: number;
  agentCode: string;
  status: string; // pending | active | suspended | terminated
  kycStatus: string; // pending | submitted | verified | rejected
  commissionRate: number;
  cashOnHand: number;
  maxCashOnHand: number;
}

export interface User {
  id: number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  walletBalance?: number;
  currency?: string;
  agent?: AgentProfile;
}

export interface AuthState {
  accessToken: string;
  user: User | null;
  refreshTokenExpire: string | null;
  loading: boolean;
  error: string | null;
  isLoggedOut: boolean;
}

const initialState: AuthState = {
  accessToken: "",
  user: null,
  refreshTokenExpire: null,
  loading: false,
  error: null,
  isLoggedOut: false,
};

export const refreshAccessToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { dispatch }) => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = new Promise<string>((resolve, reject) => {
    const refreshExpireStr = localStorage.getItem("refreshTokenExpires");
    if (!refreshExpireStr) {
      dispatch(logout());
      reject("Refresh token missing");
      return;
    }

    if (new Date(refreshExpireStr) <= new Date()) {
      dispatch(logout());
      reject("Refresh token expired");
      return;
    }

    axios
      .post(`${apiUrl}/auth/refresh-token`, {}, { withCredentials: true, timeout: 5000 })
      .then(({ data }) => {
        if (data.accessToken) dispatch(setAccessToken(data.accessToken));
        if (data.user) dispatch(setUser(data.user as User));
        if (data.refreshTokenExpires) {
          dispatch(setRefreshTokenExpires(String(data.refreshTokenExpires)));
        }
        resolve(data.accessToken);
      })
      .catch((err) => {
        dispatch(logout());
        reject(err.response?.data?.message || "Failed to refresh token");
      });
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setUser: (state, action: PayloadAction<Partial<User> | null>) => {
      if (!action.payload) {
        state.user = null;
      } else {
        state.user = { ...state.user, ...action.payload } as User;
      }
    },
    setRefreshTokenExpires: (state, action: PayloadAction<string>) => {
      localStorage.setItem("refreshTokenExpires", action.payload);
      state.refreshTokenExpire = action.payload;
    },
    logout: (state) => {
      state.accessToken = "";
      state.user = null;
      state.refreshTokenExpire = null;
      state.isLoggedOut = true;
      localStorage.removeItem("refreshTokenExpires");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.accessToken = "";
        state.user = null;
        state.refreshTokenExpire = null;
        state.error = action.payload || "Failed to refresh token";
      });
  },
});

export const { logout, setAccessToken, setUser, setRefreshTokenExpires } = authSlice.actions;
export default authSlice.reducer;
