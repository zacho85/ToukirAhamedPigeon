import { useState, useRef, useEffect } from "react";
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
import "@/styles/intl-tel-input-dark.css";

// Declare the global intlTelInput
declare global {
  interface Window {
    intlTelInput: any;
    intlTelInputUtils: any;
  }
}

// ------------------------------
// ✅ Zod Schema + Types
// ------------------------------
const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(8, "Phone number required"),
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Refs for intlTelInput
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const companyPhoneInputRef = useRef<HTMLInputElement>(null);
  const itiPhoneRef = useRef<any>(null);
  const itiCompanyPhoneRef = useRef<any>(null);
  const [phoneError, setPhoneError] = useState<string>("");
  const [companyPhoneError, setCompanyPhoneError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    trigger,
    watch
  } = useForm<RegisterFormValues>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "personal" },
  });

  // Load the utils script dynamically
  useEffect(() => {
    if (!document.querySelector('script[src*="utils.js"]')) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Initialize intlTelInput for main phone (always available)
  useEffect(() => {
    if (phoneInputRef.current && window.intlTelInput && !itiPhoneRef.current) {
      itiPhoneRef.current = window.intlTelInput(phoneInputRef.current, {
        initialCountry: "fr",
        preferredCountries: ["fr", "cm", "us", "gb", "ng", "ke", "za", "be", "ch"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        nationalMode: false,
        formatOnDisplay: true,
        autoPlaceholder: "aggressive",
      });
    }

    return () => {
      if (itiPhoneRef.current) {
        itiPhoneRef.current.destroy();
        itiPhoneRef.current = null;
      }
    };
  }, []);

  // Initialize intlTelInput for company phone when role becomes merchant
  useEffect(() => {
    // Only initialize if merchant role is selected and input exists
    if (role === "merchant" && companyPhoneInputRef.current && window.intlTelInput && !itiCompanyPhoneRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (companyPhoneInputRef.current && !itiCompanyPhoneRef.current) {
          itiCompanyPhoneRef.current = window.intlTelInput(companyPhoneInputRef.current, {
            initialCountry: "fr",
            preferredCountries: ["fr", "cm", "us", "gb", "ng", "ke", "za", "be", "ch"],
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            nationalMode: false,
            formatOnDisplay: true,
            autoPlaceholder: "aggressive",
          });
        }
      }, 100);
    }

    // Cleanup when role changes from merchant to personal
    return () => {
      if (itiCompanyPhoneRef.current) {
        itiCompanyPhoneRef.current.destroy();
        itiCompanyPhoneRef.current = null;
      }
    };
  }, [role]); // Re-run when role changes

  // Handle phone number validation and update form value
  const validatePhoneNumber = (isCompanyPhone: boolean = false) => {
    const iti = isCompanyPhone ? itiCompanyPhoneRef.current : itiPhoneRef.current;
    const setError = isCompanyPhone ? setCompanyPhoneError : setPhoneError;
    const fieldName = isCompanyPhone ? "companyPhone" : "phoneNumber";
    
    if (iti) {
      const isValid = iti.isValidNumber();
      const fullNumber = iti.getNumber();
      
      if (!isValid && fullNumber) {
        setError("Please enter a valid phone number");
        setValue(fieldName, "", { shouldValidate: true });
        return false;
      } else if (fullNumber) {
        setError("");
        setValue(fieldName, fullNumber, { shouldValidate: true });
        trigger(fieldName);
        return true;
      } else if (!fullNumber && isCompanyPhone) {
        // Company phone is optional, so empty is valid
        setError("");
        setValue(fieldName, "", { shouldValidate: true });
        return true;
      } else if (!fullNumber && !isCompanyPhone) {
        setError("Phone number is required");
        setValue(fieldName, "", { shouldValidate: true });
        return false;
      }
    }
    return false;
  };

  // Handle real-time validation on input
  const handlePhoneInput = (isCompanyPhone: boolean = false) => {
    const iti = isCompanyPhone ? itiCompanyPhoneRef.current : itiPhoneRef.current;
    if (iti) {
      const fullNumber = iti.getNumber();
      if (fullNumber) {
        validatePhoneNumber(isCompanyPhone);
      } else if (!isCompanyPhone) {
        setPhoneError("Phone number is required");
      } else if (isCompanyPhone) {
        setCompanyPhoneError("");
      }
    }
  };

  // Handle phone input focus
  const handlePhoneFocus = (isCompanyPhone: boolean = false) => {
    const setError = isCompanyPhone ? setCompanyPhoneError : setPhoneError;
    setError("");
  };

  // Handle phone input blur
  const handlePhoneBlur = (isCompanyPhone: boolean = false) => {
    validatePhoneNumber(isCompanyPhone);
  };

  // Real-time validation for regular inputs
  const handleInputChange = (field: keyof RegisterFormValues, value: string) => {
    setValue(field, value as any);
    trigger(field);
  };

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    // Final validation before submission
    const isMainPhoneValid = validatePhoneNumber(false);
    
    if (!isMainPhoneValid) {
      dispatch(
        showToast({
          type: "danger",
          message: "Please enter a valid phone number",
          position: "top-right",
          animation: "slide-right-in",
        })
      );
      return;
    }

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
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message?.message || "Registration failed. Try again.",
          position: "top-right",
          animation: "slide-right-in",
        })
      );
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
        <div className="mb-6">
          <Label className="text-gray-700 dark:text-gray-200 font-medium mb-4 mt-2 block">
            Choose Account Type
          </Label>

          <div className="flex gap-4">
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
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setRole(opt.type as "personal" | "merchant");
                  setValue("role", opt.type as "personal" | "merchant");
                }}
                className={cn(
                  "flex-1 p-4 border rounded-xl cursor-pointer flex flex-col items-center justify-center text-center space-y-2 transition-all",
                  role === opt.type
                    ? "border-gray-800 bg-gray-100 dark:border-gray-400 dark:bg-gray-800/50"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-900/50"
                )}
              >
                <div className={cn(
                  "transition-colors",
                  role === opt.type 
                    ? "text-gray-800 dark:text-gray-100" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {opt.icon}
                </div>
                <h4 className={cn(
                  "font-medium transition-colors",
                  role === opt.type 
                    ? "text-gray-800 dark:text-gray-100" 
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {opt.title}
                </h4>
                <p className={cn(
                  "text-xs transition-colors",
                  role === opt.type 
                    ? "text-gray-600 dark:text-gray-300" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {opt.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-200">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className={cn(
                    "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
                    errors.fullName && touchedFields.fullName && "border-red-500"
                  )}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  onKeyUp={(e) => handleInputChange("fullName", e.currentTarget.value)}
                  onFocus={() => trigger("fullName")}
                />
                {errors.fullName && touchedFields.fullName && (
                  <p className="text-red-500 text-sm animate-in fade-in duration-200">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="w-full">
                <input
                  id="phone"
                  ref={phoneInputRef}
                  type="tel"
                  onFocus={() => handlePhoneFocus(false)}
                  onInput={() => handlePhoneInput(false)}
                  onBlur={() => handlePhoneBlur(false)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
                    phoneError && "border-red-500"
                  )}
                  placeholder="Enter your phone number"
                />
              </div>
              <input type="hidden" {...register("phoneNumber")} />
              {phoneError && (
                <p className="text-red-500 text-sm animate-in fade-in duration-200">
                  {phoneError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select your country and enter your phone number
              </p>
            </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className={cn(
                    "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
                    errors.email && touchedFields.email && "border-red-500"
                  )}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onKeyUp={(e) => handleInputChange("email", e.currentTarget.value)}
                  onFocus={() => trigger("email")}
                />
                {errors.email && touchedFields.email && (
                  <p className="text-red-500 text-sm animate-in fade-in duration-200">
                    {errors.email.message}
                  </p>
                )}
              </div>
          </div>

          {/* Business Fields - Only show when role is merchant */}
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
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-200">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    placeholder="Enter company name"
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    onKeyUp={(e) => handleInputChange("companyName", e.currentTarget.value)}
                    onFocus={() => trigger("companyName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalForm" className="text-gray-700 dark:text-gray-200">
                    Legal Form
                  </Label>
                  <Input
                    id="legalForm"
                    {...register("legalForm")}
                    placeholder="e.g., SARL, SA, SAS"
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    onChange={(e) => handleInputChange("legalForm", e.target.value)}
                    onKeyUp={(e) => handleInputChange("legalForm", e.currentTarget.value)}
                    onFocus={() => trigger("legalForm")}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="text-gray-700 dark:text-gray-200">
                    Manager/Contact Person
                  </Label>
                  <Input
                    id="managerName"
                    {...register("managerName")}
                    placeholder="Full name of manager"
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    onChange={(e) => handleInputChange("managerName", e.target.value)}
                    onKeyUp={(e) => handleInputChange("managerName", e.currentTarget.value)}
                    onFocus={() => trigger("managerName")}
                  />
                </div>

                {/* Company Phone Field with intlTelInput */}
                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-gray-700 dark:text-gray-200">
                    Company Phone <span className="text-gray-400 text-xs">(Optional)</span>
                  </Label>
                  <div className="w-full">
                    <input
                      id="companyPhone"
                      ref={companyPhoneInputRef}
                      type="tel"
                      onFocus={() => handlePhoneFocus(true)}
                      onInput={() => handlePhoneInput(true)}
                      onBlur={() => handlePhoneBlur(true)}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
                        companyPhoneError && "border-red-500"
                      )}
                      placeholder="Enter company phone number (optional)"
                    />
                  </div>
                  <input type="hidden" {...register("companyPhone")} />
                  {companyPhoneError && (
                    <p className="text-red-500 text-sm animate-in fade-in duration-200">
                      {companyPhoneError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select country and enter company phone number (optional)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress" className="text-gray-700 dark:text-gray-200">
                  Company Address
                </Label>
                <Input
                  id="companyAddress"
                  {...register("companyAddress")}
                  placeholder="Full company address"
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                  onKeyUp={(e) => handleInputChange("companyAddress", e.currentTarget.value)}
                  onFocus={() => trigger("companyAddress")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalFormDocument" className="text-gray-700 dark:text-gray-200">
                  Legal Form Document
                </Label>
                <Input
                  id="legalFormDocument"
                  type="file"
                  {...register("legalFormDocument")}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload registration document (PDF, JPG, PNG)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription" className="text-gray-700 dark:text-gray-200">
                  Business Description
                </Label>
                <Input
                  id="businessDescription"
                  {...register("businessDescription")}
                  placeholder="Brief description of your business"
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                  onKeyUp={(e) => handleInputChange("businessDescription", e.currentTarget.value)}
                  onFocus={() => trigger("businessDescription")}
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
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                  Password <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  register={register}
                  name="password"
                  placeholder="Create a strong password"
                  onKeyUp={() => trigger("password")}
                  onFocus={() => trigger("password")}
                />
                {errors.password && touchedFields.password && (
                  <p className="text-red-500 text-sm animate-in fade-in duration-200">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-200">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  register={register}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  onKeyUp={() => trigger("confirmPassword")}
                  onFocus={() => trigger("confirmPassword")}
                />
                {errors.confirmPassword && touchedFields.confirmPassword && (
                  <p className="text-red-500 text-sm animate-in fade-in duration-200">
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