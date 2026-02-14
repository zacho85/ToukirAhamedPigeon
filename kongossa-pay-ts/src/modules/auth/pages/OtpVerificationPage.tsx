import { useState } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { resendOtp, verifyOtp } from "../api";
import { useDispatch } from "react-redux";
import {
  setAccessToken,
  setUser,
  setRefreshTokenExpires,
} from "@/redux/slices/authSlice";
import { showToast } from "@/redux/slices/toastSlice";
import { AuthFormCard } from "@/components/custom/AuthFormCard";
import { SuccessAnimation } from "@/components/custom/SuccessAnimation";
import PublicLayout from "@/layouts/PublicLayout";

// ------------------
// API Response Types
// ------------------

interface VerifyOtpResponse {
  message: string;
  accessToken?: string;
  refreshTokenExpires?: string | number;
  user?: any;
  purpose: string;
}

export default function OTPVerificationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email: string | null = params.get("email");
  const purpose: string = params.get("purpose") || "register";
  const rememberMe: boolean = params.get("rememberMe") === "true";

  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  // ----------------------
  // Handle Resend OTP
  // ----------------------
  const handleResendOtp = async () => {
    if (!email) return;

    setErrorMessage("");
    setResendLoading(true);

    try {
      await resendOtp(email, purpose);

      dispatch(
        showToast({
          type: "success",
          message: "A new OTP has been sent to your email",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message || "Failed to resend OTP.";

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

  // ----------------------
  // Handle Verify OTP
  // ----------------------
  const handleVerify = async () => {
    if (!email) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const resp: VerifyOtpResponse = await verifyOtp({
        email,
        code: otp,
        purpose,
        rememberMe,
      });

      if (resp.message?.toLowerCase().includes("success")) {
        if (resp.accessToken) dispatch(setAccessToken(resp.accessToken));
        if (resp.user) dispatch(setUser(resp.user));
        if (resp.refreshTokenExpires !== undefined) {
            dispatch(
                setRefreshTokenExpires(String(resp.refreshTokenExpires))
            );
        }
        setVerified(true);

        setTimeout(() => {
          if (purpose === "login") navigate("/dashboard");
          else navigate("/login");
        }, 1500);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message || "Verification failed.";

      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes("failed") ||
        msg.toLowerCase().includes("network")
      ) {
        dispatch(
          showToast({
            type: "danger",
            message: msg,
            position: "top-right",
            animation: "slide-right-in",
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!verified ? (
        <PublicLayout>
          <AuthFormCard
            icon={<ShieldCheck className="text-white w-8 h-8" />}
            title="Verify Your Email"
            title2={`Enter the OTP sent to ${email}`}
            subTitle=" Please check your inbox or spam folder"
            iconClassName="bg-green-600 dark:bg-green-500"
          >
            {/* OTP Form */}
            <div className="mt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#475569] dark:text-gray-300 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOtp(e.target.value)
                  }
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-[#aab4c3] dark:placeholder-gray-500 focus:ring-2 focus:ring-[#e6eef9] dark:focus:ring-gray-700 focus:border-transparent shadow-sm tracking-widest text-center text-lg font-semibold"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleVerify}
                className={`w-full py-3 rounded-xl text-white font-medium mt-4 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
                  loading
                    ? "bg-[#101827] dark:bg-gray-700 opacity-80 cursor-not-allowed"
                    : "bg-[#0b1226] dark:bg-gray-800 hover:brightness-105 cursor-pointer"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>

              {errorMessage && (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="text-sm text-[#6b7280] dark:text-gray-400 mt-6 text-center">
              Didn’t receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className={`text-[#0b1226] dark:text-gray-200 font-medium ${
                  resendLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </AuthFormCard>
        </PublicLayout>
      ) : (
        <PublicLayout>
          <SuccessAnimation
            successMessage="OTP Verified!"
            nextInstruction="Redirecting you to the next step..."
          />
        </PublicLayout>
      )}
    </>
  );
}
