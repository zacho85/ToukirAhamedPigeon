import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerAgent } from "../api";
import type { RegisterAgentPayload } from "../api";

type BasicInfo = Omit<
  RegisterAgentPayload,
  "idFrontImage" | "idBackImage" | "selfieImage" | "addressProofImage"
>;

const initialBasicInfo: BasicInfo = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  agentType: "individual",
  businessName: "",
  registrationNumber: "",
  taxId: "",
  idType: "national_id",
  idNumber: "",
  address: "",
  country: "",
};

type Documents = {
  idFrontImage?: File;
  idBackImage?: File;
  selfieImage?: File;
  addressProofImage?: File;
};

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file?: File;
  onChange: (file?: File) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0])}
        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0B1226] file:text-white"
      />
      {file && <p className="text-xs text-emerald-600 mt-1">{file.name} selected</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(initialBasicInfo);
  const [documents, setDocuments] = useState<Documents>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) => {
    setBasicInfo((prev) => ({ ...prev, [key]: value }));
  };

  const onNext = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerAgent({ ...basicInfo, ...documents });
      setSubmitted(true);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h1 className="text-lg font-bold text-[#0B1226]">Application submitted</h1>
          <p className="text-sm text-gray-500">
            Your agent application and documents are under review. We'll notify you once
            approved -- you can log in any time to check your status.
          </p>
          <Link
            to="/login"
            className="block w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="" className="h-14 w-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0B1226]">Become an agent</h1>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
        </div>

        {step === 1 && (
          <form onSubmit={onNext} className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <input
              required
              placeholder="Full name"
              value={basicInfo.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={basicInfo.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />
            <input
              required
              placeholder="Phone number (+countrycode...)"
              value={basicInfo.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />
            <input
              required
              type="password"
              minLength={8}
              placeholder="Password (min 8 characters)"
              value={basicInfo.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />

            <select
              value={basicInfo.agentType}
              onChange={(e) => updateField("agentType", e.target.value as "individual" | "business")}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            >
              <option value="individual">Individual agent</option>
              <option value="business">Business agent</option>
            </select>

            {basicInfo.agentType === "business" && (
              <>
                <input
                  placeholder="Business name"
                  value={basicInfo.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
                <input
                  placeholder="Registration number"
                  value={basicInfo.registrationNumber}
                  onChange={(e) => updateField("registrationNumber", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
                <input
                  placeholder="Tax ID"
                  value={basicInfo.taxId}
                  onChange={(e) => updateField("taxId", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </>
            )}

            <select
              value={basicInfo.idType}
              onChange={(e) =>
                updateField(
                  "idType",
                  e.target.value as "passport" | "national_id" | "drivers_license",
                )
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's license</option>
            </select>
            <input
              required
              placeholder="ID number"
              value={basicInfo.idNumber}
              onChange={(e) => updateField("idNumber", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />
            <input
              required
              placeholder="Address"
              value={basicInfo.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />
            <input
              required
              placeholder="Country"
              value={basicInfo.country}
              onChange={(e) => updateField("country", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            />

            <button
              type="submit"
              className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
            >
              Continue
            </button>

            <p className="text-center text-sm text-gray-500">
              Already an agent?{" "}
              <Link to="/login" className="text-[#0B1226] font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Upload clear photos of your identification documents for KYC verification.
            </p>
            <FileField
              label="ID front"
              file={documents.idFrontImage}
              onChange={(f) => setDocuments((prev) => ({ ...prev, idFrontImage: f }))}
            />
            <FileField
              label="ID back"
              file={documents.idBackImage}
              onChange={(f) => setDocuments((prev) => ({ ...prev, idBackImage: f }))}
            />
            <FileField
              label="Selfie holding your ID"
              file={documents.selfieImage}
              onChange={(f) => setDocuments((prev) => ({ ...prev, selfieImage: f }))}
            />
            <FileField
              label="Proof of address"
              file={documents.addressProofImage}
              onChange={(f) => setDocuments((prev) => ({ ...prev, addressProofImage: f }))}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
