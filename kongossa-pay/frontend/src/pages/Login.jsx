import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser as loginApi } from "../api/auth"; // updated import
import { setAccessToken, setUser } from "../store/authSlice";
import * as z from "zod";
import PasswordInput from "./../components/common/PasswordInput";
import { showToast } from "@/store/toastSlice";
import { AuthFormCard } from "@/components/common/AuthFormCard";
import { Checkbox } from "./../components/ui/checkbox";

const LoginSchema = z.object({
  identifier: z.string().min(1, "Email or Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);

  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

 const onSubmit = async (values) => {
  setErrorMessage("");
  setLoading(true); // ✅ start loading
  try {
    const data = await loginApi(values);

    if (data.otp_required) {
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&purpose=login&rememberMe=${rememberMe}`);
    } else {
      dispatch(setUser(data.userInfo));
      dispatch(setAccessToken(data.accessToken));
      dispatch(
        showToast({type: "success",message: "Login Successful!",position: "top-right",animation: "slide-right-in",duration: 4000,})
      );
      navigate("/dashboard");
    }
  } catch (err) {
    console.error(err);
    const msg = err?.response?.data?.message?.message || err?.message || "Login failed";
    dispatch(showToast({ message: msg, type: "danger", duration:10000 }));
    setErrorMessage(msg);
  } finally {
    setLoading(false); // ✅ stop loading
  }
};

  return (
    <AuthFormCard icon={<Wallet className="text-white w-8 h-8" />} title="Welcome to Kongossa-Pay" title2="The Future of Digital Payments" subTitle="Sign in to continue" iconClassName="bg-blue-600">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <label className="block text-sm font-medium text-[#475569] mb-2">Email or Phone</label>
          <input
            type="text"
            placeholder="you@example.com or +1234567890"
            className="w-full border rounded-md px-4 py-3 bg-[#fbfdff] placeholder-[#aab4c3] focus:outline-none focus:ring-2 focus:ring-[#e6eef9] focus:border-transparent shadow-sm"
            {...register("identifier")}
          />
          {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier.message}</p>}

          <label className="block text-sm font-medium text-[#475569] mt-4 mb-2">Password</label>
          <PasswordInput register={register} name="password" />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}

          {/* Remember Me Checkbox */}
          <div className="flex items-center mt-2">
            <Checkbox
              id="rememberMe"
              checked={!!rememberMe}
              onCheckedChange={(checked) => {setRememberMe(checked)}}
              className="border-input data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 
                        data-[state=checked]:text-white transition-colors"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#475569]">Remember me for 30 days</label>
          </div>

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading} 
            className={`w-full py-3 rounded-xl text-white font-medium mt-6 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ${
              loading ? "bg-[#101827] opacity-80 cursor-not-allowed" : "bg-[#0b1226] hover:brightness-105"
            }`}
          >
            {loading ? "Signing In..." : "Sign in"} {/* ✅ text change */}
          </motion.button>

          {errorMessage && <div className="mt-4 text-sm text-center text-red-600">{errorMessage}</div>}

          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              type="button"
              className="text-[#0b1226] font-medium px-3 py-1 rounded"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
            <div className="text-[#6b7280]">
              Need an account?{" "}
              <Link to="/register" className="text-[#0b1226] font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </form>
    </AuthFormCard>
  );
}
