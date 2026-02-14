import React, { useEffect, useState, useRef } from "react";
import Pages from "@/pages/index.jsx"; // AppRouter
import GlobalLoader from "@/components/common/GlobalLoader";
import ToastContainer from "@/components/common/ToastContainer";
import { Toaster } from "@/components/ui/toaster";
import { useDispatch } from "react-redux";
import { refreshAccessToken } from "@/store/authSlice";
import useNetworkToast from "@/utils/useNetworkToast";

export default function App() {
  useNetworkToast();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const hasInitRef = useRef(false); // prevent double run

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    const initAuth = async () => {
      try {
        await dispatch(refreshAccessToken()).unwrap();
        console.log("Token refreshed");
      } catch (err) {
        console.log("Token refresh failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* GlobalLoader will now only be used for API calls or actions, not route changes */}
      <Pages />
      <ToastContainer />
      <Toaster />
    </>
  );
}
