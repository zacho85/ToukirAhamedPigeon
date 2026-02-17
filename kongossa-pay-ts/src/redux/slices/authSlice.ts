import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_API_URL;

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
  error: string;
  isLoggedOut: boolean;
}

// 🔹 Initial state with proper typing
const initialState: AuthState = {
  accessToken: "",
  user: null,
  refreshTokenExpire: null,
  loading: false,
  error: "",
  isLoggedOut: false,
};

// 🔹 Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk<
  string, // Return type
  void,   // Argument type
  { rejectValue: string; dispatch: any } // ThunkAPI types
>(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshExpireStr = localStorage.getItem("refreshTokenExpires");
      if (!refreshExpireStr) {
        dispatch(logout());
        return rejectWithValue("Refresh token missing");
      }

      const expireDate = new Date(refreshExpireStr);
      if (expireDate <= new Date()) {
        dispatch(logout());
        return rejectWithValue("Refresh token expired");
      }

      const { data } = await axios.post(
        `${apiUrl}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      console.log(data);

      if (data.accessToken) dispatch(setAccessToken(data.accessToken));
      if (data.user) dispatch(setUser(data.user as User));
      if (data.refreshTokenExpires) dispatch(setRefreshTokenExpires(data.refreshTokenExpires));

      return data.accessToken;
    } catch (err: any) {
      dispatch(logout());
      return rejectWithValue(err.response?.data?.message || "Failed to refresh token");
    }
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
      })
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
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
