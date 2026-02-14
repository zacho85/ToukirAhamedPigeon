// src/store/toastSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: (options) => ({
        payload: {
          id: nanoid(),
          type: options.type || "info", // success | danger | warning | info | custom
          message: options.message || "",
          showClose: options.showClose ?? true,
          position: options.position || "top-right",
          animation: options.animation || "slide-right-in",
          duration: options.duration || 3000,
        },
      }),
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { showToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
