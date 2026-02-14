import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice";

export default function useNetworkToast() {
  const dispatch = useDispatch();
  const offlineRef = useRef(false); // track offline state

  useEffect(() => {
    const handleOffline = () => {
      if (!offlineRef.current) {
        offlineRef.current = true;
        dispatch(
          showToast({
            type: "danger",
            message: "No internet connection",
            position: "top-center",
            animation: "slide-down-in",
            duration: 0,
            showClose: false,
          })
        );
      }
    };

    const handleOnline = () => {
      if (offlineRef.current) {
        offlineRef.current = false;
        dispatch(
          showToast({
            type: "success",
            message: "Internet connection restored",
            position: "top-center",
            animation: "slide-down-in",
            duration: 3000, // auto dismiss after 3s
          })
        );
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // cleanup
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [dispatch]);
}
