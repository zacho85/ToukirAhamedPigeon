import { useEffect, useState } from "react";
import SettingsLayout from "./SettingsLayout";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import HeadingSmall from "@/components/dashboard/HeadingSmall";
import AppearanceTabs from "@/components/dashboard/AppearanceToggleTab";

import { getAppearanceSettings } from "@/api/settings";
import { showToast } from "@/store/toastSlice"; 
import { useDispatch } from "react-redux";

export default function Appearance() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const fetchAppearance = async () => {
    try {
      setLoading(true);
      const data = await getAppearanceSettings();
      setSettings(data);
      dispatch(
        showToast({
          type: "success",
          message: "Appearance settings loaded successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to load appearance settings!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppearance();
  }, []);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings" },
    { label: "Appearance" },
  ];

  if (loading) return <p className="text-center py-10 text-muted-foreground">Loading...</p>;

  return (
    <SettingsLayout>
      <div className="space-y-6 mt-10">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

        <HeadingSmall
          title="Appearance settings"
          description="Update your account's appearance settings"
        />

        {/* Pass settings to your tabs if needed */}
        <AppearanceTabs settings={settings} />
      </div>
    </SettingsLayout>
  );
}
