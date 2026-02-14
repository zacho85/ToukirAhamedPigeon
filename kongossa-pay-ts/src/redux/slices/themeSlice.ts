// store/themeSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  current: Theme;
}

const getSystemDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const applyTheme = (theme: Theme) => {
  const isDark =
    theme === "dark" || (theme === "system" && getSystemDark());
  document.documentElement.classList.toggle("dark", isDark);
};

const savedTheme =
  (typeof window !== "undefined" &&
    (localStorage.getItem("theme") as Theme)) ||
  "system";

const initialState: ThemeState = {
  current: savedTheme,
};

applyTheme(savedTheme);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.current = action.payload;
      localStorage.setItem("theme", action.payload);
      applyTheme(action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
