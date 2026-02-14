// store/loaderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visible: false,
  message: "",
  spinnerColor: "#000000",
  messageColor: "#000000",
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    showLoader: (state, action) => {
      const { message, spinnerColor, messageColor } = action.payload || {};
      state.visible = true;
      state.message = message || "";
      state.spinnerColor = spinnerColor || "#000000";
      state.messageColor = messageColor || "#000000";
    },
    hideLoader: (state) => {
      state.visible = false;
      state.message = "";
      state.spinnerColor = "#000000";
      state.messageColor = "#000000";
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
