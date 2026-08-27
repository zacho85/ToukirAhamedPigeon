import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resendOtp, verifyOtp } from "../api";
import { setAccessToken, setUser, setRefreshTokenExpires } from "@/redux/slices/authSlice";

export default function OtpVerificationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = params.get("email") || "";
  const purpose = params.get("purpose") || "login";
  const rememberMe = params.get("rememberMe") === "true";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await verifyOtp({ email, code: otp, purpose, rememberMe });

      if (!resp.message?.toLowerCase().includes("success")) {
        setError("Invalid OTP. Please try again.");
        return;
      }

      if (resp.accessToken) dispatch(setAccessToken(resp.accessToken));
      if (resp.user) dispatch(setUser(resp.user));
      if (resp.refreshTokenExpires !== undefined) {
        dispatch(setRefreshTokenExpires(String(resp.refreshTokenExpires)));
      }

      navigate("/dashboard");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Verification failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setError("");
    try {
      await resendOtp(email, purpose);
    } catch {
      setError("Could not resend the code. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1226] flex items-center justify-center mb-4">
            <span className="text-emerald-400 font-bold text-xl">K</span>
          </div>
          <h1 className="text-xl font-bold text-[#0B1226]">Verify your identity</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter the 6-digit code sent to <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="------"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="w-full text-sm text-gray-500 disabled:opacity-60"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </form>
      </div>
    </div>
  );
}
