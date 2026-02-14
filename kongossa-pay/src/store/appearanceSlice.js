import { createSlice } from "@reduxjs/toolkit";

const initialAppearance =
  localStorage.getItem("appearance") || "system";

const appearanceSlice = createSlice({
  name: "appearance",
  initialState: {
    mode: initialAppearance,
  },
  reducers: {
    setAppearance: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("appearance", action.payload);
    },
  },
});

export const { setAppearance } = appearanceSlice.actions;
export default appearanceSlice.reducer;
