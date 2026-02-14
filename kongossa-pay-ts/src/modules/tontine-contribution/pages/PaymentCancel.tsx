import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
export default function PaymentCancel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("Processing payment cancellation...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setMessage("No session found.");
      setTimeout(() => navigate("/tontine-contributions"), 5000);
      return;
    }

    const stripeCheckoutCancel = async () => {
      try {
        const res = await axios.get("/api/stripe/checkout/cancel", { params: { sessionId }, withCredentials: true });
        dispatch(
          showToast({
            type: res.data.success ? "success" : "danger",
            message: res.data.success ? "Payment was canceled. Redirecting..." : "Payment was canceled but something went wrong.",
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
            message: "Payment cancellation failed.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      } finally {
        setTimeout(() => navigate("/tontine-contributions"), 5000);
      }
    };

    stripeCheckoutCancel();
  }, [navigate, dispatch]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        <p>{message}</p>
      </div>
    </PageTransition>
  );
}
