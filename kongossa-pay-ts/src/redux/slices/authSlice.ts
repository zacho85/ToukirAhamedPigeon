import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_API_URL;
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// 🔹 Define the User type returned from your backend
export interface User {
  id: number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  walletBalance?: number;
  currency?: string;
  rewards_points?: number;
  role?: string;
  isActive?: boolean;
  permissions?: string[];
}

// 🔹 Define the Auth slice state
export interface AuthState {
  accessToken: string;
  user: User | null;
  refreshTokenExpire: string | null;
  loading: boolean;
  error: string | null;  // ✅ Changed from string to string | null
  isLoggedOut: boolean;
}

// 🔹 Initial state with proper typing
const initialState: AuthState = {
  accessToken: "",
  user: null,
  refreshTokenExpire: null,
  loading: false,
  error: null,  // ✅ Changed from "" to null
  isLoggedOut: false,
};

// 🔹 Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk<
  string,  // Return type
  void,    // Argument type
  { rejectValue: string }  // Reject value type
>(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    // Prevent multiple concurrent refresh requests
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const refreshExpireStr = localStorage.getItem("refreshTokenExpires");
        if (!refreshExpireStr) {
          dispatch(logout());
          reject("Refresh token missing");
          return;
        }

        const expireDate = new Date(refreshExpireStr);
        if (expireDate <= new Date()) {
          dispatch(logout());
          reject("Refresh token expired");
          return;
        }

        const { data } = await axios.post(
          `${apiUrl}/auth/refresh-token`,
          {},
          { withCredentials: true, timeout: 5000 }
        );

        if (data.accessToken) dispatch(setAccessToken(data.accessToken));
        if (data.user) dispatch(setUser(data.user as User));
        if (data.refreshTokenExpires) dispatch(setRefreshTokenExpires(data.refreshTokenExpires));

        resolve(data.accessToken);
      } catch (err: any) {
        dispatch(logout());
        reject(err.response?.data?.message || "Failed to refresh token");
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    return refreshPromise;
  }
);

// 🔹 Slice definition
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
        state.user = {
          ...state.user,
          ...action.payload,
        } as User;
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
        state.accessToken = action.payload;  // ✅ Store the new token
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

// 🔹 Export actions and reducer
export const { logout, setAccessToken, setUser, setRefreshTokenExpires } = authSlice.actions;
export default authSlice.reducer;