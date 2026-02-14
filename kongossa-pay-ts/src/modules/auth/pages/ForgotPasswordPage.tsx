import { useState } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Unlock } from "lucide-react";
import { sendForgotPassword } from "../api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import { AuthFormCard } from "@/components/custom/AuthFormCard";
import PublicLayout from "@/layouts/PublicLayout";

interface ApiResponse {
  message?: string;
}

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  // -----------------------------
  // Send Reset Link
  // -----------------------------
  const handleSend = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const res = (await sendForgotPassword(email)) as ApiResponse;
      setSuccess(true);

      dispatch(
        showToast({
          type: "success",
          message: res.message || "Reset link sent successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message || "Failed to send reset email.";
      setErrorMessage(msg);

      dispatch(
        showToast({
          type: "danger",
          message: msg,
          position: "top-right",
          animation: "slide-right-in",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Resend Reset Link
  // -----------------------------
  const handleResend = async () => {
    setErrorMessage("");
    setResendLoading(true);

    try {
      const res = (await sendForgotPassword(email)) as ApiResponse;

      dispatch(
        showToast({
          type: "success",
          message: res.message || "New reset link sent!",
          position: "top-right",
          animation: "slide-right-in",
        })
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message || "Failed to resend email.";
      setErrorMessage(msg);

      dispatch(
        showToast({
          type: "danger",
          message: msg,
          position: "top-right",
          animation: "slide-right-in",
        })
      );
    } finally {
      setResendLoading(false);
    }
  };

  // -----------------------------
  // Input Change Handler
  // -----------------------------
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <PublicLayout>
      <AuthFormCard
        icon={<Unlock className="text-white w-8 h-8" />}
        title="Forgot Password"
        subTitle="Enter your registered email to receive a password reset link"
        iconClassName="bg-red-600 dark:bg-red-500"
      >
        <div className="mt-6 space-y-3">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-[#475569] dark:text-gray-200 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-[#aab4c3] dark:placeholder-gray-500 focus:ring-2 focus:ring-[#e6eef9] dark:focus:ring-gray-700 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading || !email}
            onClick={success ? handleResend : handleSend}
            className={`w-full py-3 rounded-xl cursor-pointer text-white font-medium mt-4 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
              loading
                ? "bg-[#101827] dark:bg-gray-700 opacity-80 cursor-not-allowed"
                : "bg-[#0b1226] dark:bg-gray-900 hover:brightness-105"
            }`}
          >
            {!success
              ? loading
                ? "Sending..."
                : "Send Reset Link"
              : resendLoading
              ? "Resending..."
              : "Resend Reset Link"}
          </motion.button>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
              {errorMessage}
            </div>
          )}
        </div>
      </AuthFormCard>
    </PublicLayout>
  );
}
