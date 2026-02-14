import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Key, CheckCircle2 } from "lucide-react";
import { resetPassword } from "../api/auth";
import PasswordInput from "./../components/common/PasswordInput";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; // ✅ new import
import {AuthFormCard} from "@/components/common/AuthFormCard";
import { SuccessAnimation } from "@/components/common/SuccessAnimation";



const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must match password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (values) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await resetPassword(token, values.password);
      setSuccess(true);

      // ✅ Success toast
    //   dispatch(
    //     showToast({
    //       type: "success",
    //       message: "Password reset successful! Redirecting to login...",
    //       position: "top-center",
    //       animation: "slide-down-in",
    //       duration: 4000,
    //     })
    //   );

      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      const msg = err?.response?.data?.message?.message || "Password reset failed.";
      setErrorMessage(msg);

      // ✅ Error toast for server/network issues
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
return(<>
    {!success ? (
          <>
          <AuthFormCard
            title="Reset Password"
            icon={<Key className="text-white w-8 h-8" />}
            subTitle="Enter your new password below.">

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  New Password
                </label>
                <PasswordInput register={register} name="password" />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Confirm Password
                </label>
                <PasswordInput register={register} name="confirmPassword" />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-medium mt-4 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] transition ${
                  loading
                    ? "bg-[#101827] opacity-80 cursor-not-allowed"
                    : "bg-[#0b1226] hover:brightness-105"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>

              {errorMessage && (
                <div className="text-sm text-red-600 text-center mt-2">
                  {errorMessage}
                </div>
              )}
            </form>
            </AuthFormCard>
          </>
        ) : (
          <SuccessAnimation
            successMessage="Password reset successful!"
            nextInstruction="Redirecting you to login page..."
          />
        )}
        </>);
}
