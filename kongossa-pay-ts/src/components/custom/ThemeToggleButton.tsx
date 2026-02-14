import { Sun, Moon, Monitor } from "lucide-react";
import { useAppearance } from "@/hooks/useAppearance";

export function ThemeToggleButton() {
  const { appearance, updateAppearance } = useAppearance();

  const next =
    appearance === "light"
      ? "dark"
      : appearance === "dark"
      ? "system"
      : "light";

  return (
    <button
      onClick={() => updateAppearance(next)}
      className="p-1 rounded-full bg-white dark:bg-gray-800 cursor-pointer"
    >
      {appearance === "light" && <Moon size={16} />}
      {appearance === "dark" && <Sun size={16} />}
      {appearance === "system" && <Monitor size={16} />}
    </button>
  );
}
