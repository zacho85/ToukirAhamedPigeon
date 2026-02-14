import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

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
        const res = await axios.get("/api/stripe/checkout/cancel", {
          params: { sessionId },
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(
            showToast({
              type: "success",
              message: "Payment was canceled. Redirecting to contributions...",
              position: "top-right",
              animation: "slide-right-in",
              duration: 4000,
            })
          );
        } else {
          dispatch(
            showToast({
              type: "error",
              message: "Payment was canceled but something went wrong.",
              position: "top-right",
              animation: "slide-right-in",
              duration: 4000,
            })
          );
        }
      } catch (err) {
        console.error("Stripe cancel API failed", err);
        dispatch(
          showToast({
            type: "error",
            message: "Payment cancellation failed.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      } finally {
        // Redirect after 5 seconds
        setTimeout(() => navigate("/tontine-contributions"), 5000);
      }
    };

    stripeCheckoutCancel();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      <p>{message}</p>
    </div>
  );
}
