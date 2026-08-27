import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

interface Props {
  status?: string;
  kycStatus?: string;
  kycRejectionReason?: string | null;
}

const STATUS_COPY: Record<string, string> = {
  pending: "Your application is being reviewed by our team.",
  suspended: "Your agent account has been suspended. Contact support for details.",
  terminated: "Your agent account is no longer active.",
};

export default function PendingApprovalPage({ status, kycStatus, kycRejectionReason }: Props) {
  const dispatch = useDispatch();
  const isRejected = kycStatus === "rejected";

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
            isRejected ? "bg-red-100" : "bg-amber-100"
          }`}
        >
          <span className={`text-2xl ${isRejected ? "text-red-600" : "text-amber-600"}`}>
            {isRejected ? "!" : "⏳"}
          </span>
        </div>
        <h1 className="text-lg font-bold text-[#0B1226]">
          {isRejected ? "Application not approved" : "Awaiting approval"}
        </h1>
        <p className="text-sm text-gray-500">
          {isRejected
            ? kycRejectionReason || "Your KYC documents were not approved."
            : STATUS_COPY[status || "pending"] || STATUS_COPY.pending}
        </p>
        <button
          onClick={() => dispatch(logout())}
          className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
