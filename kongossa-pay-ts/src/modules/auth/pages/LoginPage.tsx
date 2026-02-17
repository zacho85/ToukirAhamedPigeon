import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginApi } from "../api";
import { setAccessToken, setUser } from "@/redux/slices/authSlice";
import * as z from "zod";
import PasswordInput from "@/components/custom/PasswordInput";
import { showToast } from "@/redux/slices/toastSlice";
import { AuthFormCard } from "@/components/custom/AuthFormCard";
import { Checkbox } from "@/components/ui/checkbox";
import PublicLayout from "@/layouts/PublicLayout";

// ---------------------
// Zod Schema + TS Types
// ---------------------
const LoginSchema = z.object({
  identifier: z.string().min(1, "Email or Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: { identifier: "", password: "" },
  });

  // ---------------------
  // Submit Handler
  // ---------------------
  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorMessage("");
    setLoading(true);

    try {
      const data = (await loginApi(values)) as {
        email: any;
        otp_required: boolean;
        userInfo?: any;
        accessToken?: string;
      };

      if (data.otp_required) {
        navigate(
          `/verify-otp?email=${encodeURIComponent(
            data.email
          )}&purpose=login&rememberMe=${rememberMe}`
        );
      } else {
        dispatch(setUser(data.userInfo));
        if (!data.accessToken) return;
        dispatch(setAccessToken(data.accessToken));

        dispatch(
          showToast({
            type: "success",
            message: "Login Successful!",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message?.message ||
        err?.message ||
        "Login failed";

      dispatch(showToast({ message: msg, type: "danger", duration: 10000 }));
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------
  // Render
  // ---------------------
  return (
    <PublicLayout>
      <AuthFormCard
        icon={<Wallet className="text-white w-8 h-8" />}
        title="Welcome to Kongossa-Pay"
        title2="The Future of Digital Payments"
        subTitle="Sign in to continue"
        iconClassName="bg-blue-600 dark:bg-blue-500"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Identifier */}
          <label className="block text-sm font-medium text-[#475569] dark:text-gray-200 mb-2">
            Email or Phone
          </label>
          <input
            type="text"
            placeholder="you@example.com or +1234567890"
            className="w-full border rounded-md px-4 py-3
              bg-[#fbfdff] dark:bg-gray-900
              border-gray-200 dark:border-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-[#aab4c3] dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#e6eef9] dark:focus:ring-gray-700
              focus:border-transparent shadow-sm"
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-xs text-red-500 mt-1">
              {errors.identifier.message}
            </p>
          )}

          {/* Password */}
          <label className="block text-sm font-medium text-[#475569] dark:text-gray-200 mt-4 mb-2">
            Password
          </label>
          <PasswordInput register={register} name="password" />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}

          {/* Remember Me */}
          <div className="flex items-center mt-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked: boolean) => setRememberMe(checked)}
              className="border-input data-[state=checked]:bg-gray-800
                data-[state=checked]:border-gray-800 data-[state=checked]:text-white
                dark:border-gray-600 dark:data-[state=checked]:bg-white
                dark:data-[state=checked]:border-white dark:data-[state=checked]:text-black
                transition-colors cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-[#475569] dark:text-gray-300"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium mt-6 cursor-pointer
              shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
                loading
                  ? "bg-[#101827] dark:bg-gray-700 opacity-80 cursor-not-allowed"
                  : "bg-[#0b1226] dark:bg-white dark:text-black hover:brightness-105"
              }`}
          >
            {loading ? "Signing In..." : "Sign in"}
          </motion.button>

          {/* Error */}
          {errorMessage && (
            <div className="mt-4 text-sm text-center text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Footer Links */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              type="button"
              className="text-[#0b1226] dark:text-gray-100 font-medium px-3 py-1 rounded cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>

            <div className="text-[#6b7280] dark:text-gray-400">
              Need an account?{" "}
              <Link
                to="/register"
                className="text-[#0b1226] dark:text-gray-100 font-medium cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </AuthFormCard>
    </PublicLayout>
  );
}
