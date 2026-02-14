import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_API_URL;

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshExpireStr = localStorage.getItem("refreshTokenExpires");
      if (!refreshExpireStr) {
        dispatch(logout());
        return rejectWithValue("Refresh token missing");
      }
      if (refreshExpireStr) {
        const expireDate = new Date(refreshExpireStr);
        if (expireDate <= new Date()) {
          // refresh token expired
          dispatch(logout());
          return rejectWithValue("Refresh token expired");
        }
      }

      const { data } = await axios.post(
        `${apiUrl}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      if (data.accessToken) dispatch(setAccessToken(data.accessToken));
      if (data.user) dispatch(setUser(data.user));
      if (data.refreshTokenExpires) {
        dispatch(setRefreshTokenExpires(data.refreshTokenExpires));
      }

      return data.accessToken;
    } catch (err) {
      dispatch(logout());
      return rejectWithValue(err.response?.data?.message || "Failed to refresh token");
    }
  }
);

const initialState = {
  accessToken: "",
  user: null,
  refreshTokenExpire: null,
  loading: false,
  error: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRefreshTokenExpires: (state, action) => {
      localStorage.setItem("refreshTokenExpires", action.payload);
      state.refreshTokenExpire = action.payload;
    },
    logout: (state) => {
      state.accessToken = "";
      state.user = null;
      state.refreshTokenExpire = null;
      localStorage.removeItem("refreshTokenExpires");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => { state.loading = true; })
      .addCase(refreshAccessToken.fulfilled, (state, action) => { state.loading = false; })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.loading = false;
        state.accessToken = "";
        state.user = null;
        state.refreshTokenExpire = null;
      });
  },
});

export const { logout, setAccessToken, setUser, setRefreshTokenExpires } = authSlice.actions;
export default authSlice.reducer;
