// Appearance.tsx
import { useEffect, useState } from "react";
import SettingsLayout from "./SettingsLayout";
import HeadingSmall from "@/modules/settings/components/HeadingSmall";
import AppearanceTabs from "@/modules/settings/components/AppearanceToggleTab";
import { getAppearanceSettings } from "@/modules/settings/api";
import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";

export default function Appearance() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await getAppearanceSettings();
      } catch (err: any) {
        dispatch(
          showToast({
            type: "danger",
            message: err.message || "Failed to load appearance settings!",
          })
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  if (loading)
    return (
      <p className="text-center py-10 text-muted-foreground dark:text-gray-200">
        Loading...
      </p>
    );

  return (
    <SettingsLayout>
      <div className="space-y-6 mt-10">
        <HeadingSmall
          title="Appearance settings"
          description="Update your account's appearance settings"
        />
        <AppearanceTabs />
      </div>
    </SettingsLayout>
  );
}
