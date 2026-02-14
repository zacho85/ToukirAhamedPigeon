import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAppearance } from "@/store/appearanceSlice";

import {
  applyTheme,
  initializeTheme,
  handleSystemThemeChange,
} from "@/hooks/use-appearance"; 


export default function useAppearanceRedux() {
  const dispatch = useDispatch();
  const appearance = useSelector((state) => state.appearance.mode);

  // Apply theme on load
  useEffect(() => {
    initializeTheme();
  }, []);

  // Apply theme when Redux changes
  useEffect(() => {
    applyTheme(appearance);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handleSystemThemeChange);

    return () => mq.removeEventListener("change", handleSystemThemeChange);
  }, [appearance]);

  const updateAppearance = (mode) => {
    dispatch(setAppearance(mode));
  };

  return {
    appearance,
    updateAppearance,
  };
}