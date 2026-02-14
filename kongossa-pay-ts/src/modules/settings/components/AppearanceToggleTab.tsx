import { Sun, Moon, Monitor } from "lucide-react";
import { useAppearance } from "@/hooks/useAppearance";
import type { Theme } from "@/redux/slices/themeSlice";

export default function AppearanceToggleTab() {
  const { appearance, updateAppearance } = useAppearance();

  const tabs = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {tabs.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => updateAppearance(value as Theme)}
          className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer ${
            appearance === value
              ? "bg-white dark:bg-neutral-700"
              : "text-neutral-500"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="ml-1.5">{label}</span>
        </button>
      ))}
    </div>
  );
}
