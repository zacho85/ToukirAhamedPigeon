import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stripeCheckoutSuccess } from "@/modules/tontine/api/stripe";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setMessage("No session found.");
      setTimeout(() => navigate("/tontine-contributions"), 5000);
      return;
    }

    const alreadyCalled = sessionStorage.getItem(sessionId);
    if (alreadyCalled) return;
    sessionStorage.setItem(sessionId, "true");

    const stripeCheckout = async () => {
      try {
        const res = await stripeCheckoutSuccess(sessionId);
        if (res.data.success) {
          setMessage("Payment successful! Redirecting...");
          dispatch(showToast({
            type: "success",
            message: "Payment successful! Redirecting...",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          }));
        } else {
          setMessage("Payment succeeded but contribution failed.");
          dispatch(showToast({
            type: "danger",
            message: "Payment succeeded but contribution failed.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          }));
        }
      } catch (err) {
        console.error(err);
        setMessage("Payment could not be verified.");
        dispatch(showToast({
          type: "danger",
          message: "Payment could not be verified.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        }));
      } finally {
        setTimeout(() => navigate("/tontine-contributions"), 5000);
      }
    };

    stripeCheckout();
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
