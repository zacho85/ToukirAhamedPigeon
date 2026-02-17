import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Building, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthFormCard } from "@/components/custom/AuthFormCard";
import PasswordInput from "@/components/custom/PasswordInput";
import { registerUser } from "@/modules/auth/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PublicLayout from "@/layouts/PublicLayout";

// ------------------------------
// ✅ Zod Schema + Types
// ------------------------------
const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(8, "Phone number required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
    role: z.enum(["personal", "merchant"]),
    companyName: z.string().optional(),
    companyPhone: z.string().optional(),
    managerName: z.string().optional(),
    companyAddress: z.string().optional(),
    businessDescription: z.string().optional(),
    legalForm: z.string().optional(),
    legalFormDocument: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ------------------------------
// 🔑 Register Component
// ------------------------------
export default function Register() {
  const [role, setRole] = useState<"personal" | "merchant">("personal");
  const [loading, setLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    mode: "onBlur",
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "personal" },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    // setErrorMessage("");
    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in values) {
        if (key === "legalFormDocument") {
          if (values.legalFormDocument?.[0]) {
            formData.append("legalFormDocument", values.legalFormDocument[0]);
          }
        } else {
          formData.append(key, values[key as keyof RegisterFormValues] ?? "");
        }
      }

      const data = await registerUser(formData);

      if (data?.otpSent) {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        dispatch(
          showToast({
            type: "danger",
            message: "Registration Failed. OTP could not be sent.",
            position: "top-right",
            animation: "slide-right-in",
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      // setErrorMessage(
      //   err?.response?.data?.message?.message ||
      //     "Registration failed. Try again."
      // );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <AuthFormCard
        title="Create your account"
        icon={<User className="text-white w-8 h-8" />}
        subTitle={
          <>
            Choose your account type and fill in your details to get started with{" "}
            <span className="font-semibold">Kongossa Pay</span>
          </>
        }
        iconClassName="bg-gray-600 dark:bg-gray-700"
        cardWidth="max-w-lg md:max-w-2xl"
      >
        {/* Account Type */}
        <div>
          <Label className="text-gray-700 dark:text-gray-200 font-medium">
            Choose Account Type
          </Label>

          <div className="flex gap-4 mt-3">
            {[
              {
                type: "personal",
                title: "Personal",
                desc: "For individual use and personal finance management",
                icon: <User className="w-6 h-6" />,
              },
              {
                type: "merchant",
                title: "Business",
                desc: "For companies, merchant & business operations",
                icon: <Building className="w-6 h-6" />,
              },
            ].map((opt) => (
              <motion.div
                key={opt.type}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() =>
                  setRole(opt.type as "personal" | "merchant")
                }
                className={cn(
                  "flex-1 p-4 border rounded-xl cursor-pointer flex flex-col items-center justify-center text-center space-y-1",
                  role === opt.type
                    ? "border-gray-800 bg-gray-100 dark:border-gray-500 dark:bg-gray-800"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500"
                )}
              >
                <div className="text-gray-700 dark:text-gray-200">
                  {opt.icon}
                </div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  {opt.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {opt.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mt-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Full Name</Label>
                <Input
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="dark:text-gray-200">Email Address</Label>
                <Input
                  {...register("email")}
                  placeholder="Enter your email address"
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="dark:text-gray-200">Phone Number</Label>
              <Input
                {...register("phoneNumber")}
                placeholder="Enter your phone number"
                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Business Fields */}
          {role === "merchant" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Building className="w-4 h-4" /> Business Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-gray-200">Company Name</Label>
                  <Input
                    {...register("companyName")}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label className="dark:text-gray-200">Legal Form</Label>
                  <Input
                    {...register("legalForm")}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-gray-200">
                    Manager/Contact Person
                  </Label>
                  <Input
                    {...register("managerName")}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label className="dark:text-gray-200">Company Phone</Label>
                  <Input
                    {...register("companyPhone")}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-200">Company Address</Label>
                <Input
                  {...register("companyAddress")}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <Label className="dark:text-gray-200">
                  Legal Form Document
                </Label>
                <Input
                  type="file"
                  {...register("legalFormDocument")}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <Label className="dark:text-gray-200">
                  Business Description
                </Label>
                <Input
                  {...register("businessDescription")}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </motion.div>
          )}

          {/* Security */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Security
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Password</Label>
                <PasswordInput
                  register={register}
                  name="password"
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="dark:text-gray-200">
                  Confirm Password
                </Label>
                <PasswordInput
                  register={register}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-black dark:text-white font-medium hover:underline"
            >
              Sign in here
            </a>
          </p>
        </form>
      </AuthFormCard>
    </PublicLayout>
  );
}
