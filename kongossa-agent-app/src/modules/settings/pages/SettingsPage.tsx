import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { getMyAgentProfile } from "@/modules/agents/api";

interface AgentProfile {
  agentCode: string;
  commissionRate: number;
  status: string;
  kycStatus: string;
  user?: { fullName?: string; email?: string; phoneNumber?: string };
}

export default function SettingsPage() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<AgentProfile | null>(null);

  useEffect(() => {
    getMyAgentProfile().then(setProfile);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
        <Row label="Name" value={profile?.user?.fullName} />
        <Row label="Email" value={profile?.user?.email} />
        <Row label="Phone" value={profile?.user?.phoneNumber} />
        <Row label="Agent code" value={profile?.agentCode} />
        <Row
          label="Commission rate"
          value={profile ? `${profile.commissionRate}%` : undefined}
        />
      </div>

      <button
        onClick={() => dispatch(logout())}
        className="w-full border border-red-200 text-red-600 font-medium py-3 rounded-xl"
      >
        Log out
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-[#0B1226] text-right break-words min-w-0">
        {value ?? "--"}
      </span>
    </div>
  );
}
