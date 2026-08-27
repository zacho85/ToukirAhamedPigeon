import api from "@/lib/axios";

export interface RegisterAgentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  agentType: "individual" | "business";
  businessName?: string;
  registrationNumber?: string;
  taxId?: string;
  idType: "passport" | "national_id" | "drivers_license";
  idNumber: string;
  address: string;
  country: string;
  idFrontImage?: File;
  idBackImage?: File;
  selfieImage?: File;
  addressProofImage?: File;
}

export const registerAgent = async (payload: RegisterAgentPayload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value as string | Blob);
  });

  const res = await api.post("/agents/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const login = async (identifier: string, password: string, rememberMe: boolean) => {
  const res = await api.post(
    "/auth/login",
    { identifier, password, rememberMe },
    { withCredentials: true },
  );
  return res.data;
};

export const resendOtp = async (email: string, purpose: string) => {
  const res = await api.post("/auth/resend-otp", { email, purpose });
  return res.data;
};

export const verifyOtp = async (body: {
  email: string;
  code: string;
  purpose: string;
  rememberMe: boolean;
}) => {
  const res = await api.post("/auth/verify-otp", body, { withCredentials: true });
  return res.data;
};
