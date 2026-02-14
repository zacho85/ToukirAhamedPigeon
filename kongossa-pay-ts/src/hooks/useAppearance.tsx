// hooks/useAppearance.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setTheme, type Theme, applyTheme } from "@/redux/slices/themeSlice";
import { useEffect } from "react";

export function useAppearance() {
  const dispatch = useDispatch();
  const appearance = useSelector(
    (state: RootState) => state.theme.current
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      if (appearance === "system") {
        applyTheme("system");
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [appearance]);

  return {
    appearance,
    updateAppearance: (theme: Theme) => dispatch(setTheme(theme)),
  };
}
