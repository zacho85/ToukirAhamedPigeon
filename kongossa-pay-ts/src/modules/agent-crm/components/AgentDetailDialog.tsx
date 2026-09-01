import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/custom/Can";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import {
  getAgentById,
  approveAgent,
  suspendAgent,
  activateAgent,
  updateCommission,
} from "../api";

const API_URL = import.meta.env.VITE_APP_API_URL as string;

interface AgentDetail {
  id: number;
  agentCode: string;
  status: string;
  kycStatus: string;
  kycRejectionReason?: string | null;
  commissionRate: number;
  cashOnHand: number;
  maxCashOnHand: number;
  idFrontImage?: string | null;
  idBackImage?: string | null;
  selfieImage?: string | null;
  addressProofImage?: string | null;
  user?: { fullName?: string; email?: string; phoneNumber?: string; createdAt?: string };
  cashTransactions?: Array<{
    id: number;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  daySettlements?: Array<{
    id: number;
    settlementDate: string;
    status: string;
    variance: number;
  }>;
}

function DocThumb({ label, path }: { label: string; path?: string | null }) {
  if (!path) {
    return (
      <div className="text-xs text-muted-foreground border border-dashed rounded-lg p-3 text-center">
        {label}: not provided
      </div>
    );
  }
  return (
    <a
      href={`${API_URL}/${path}`}
      target="_blank"
      rel="noreferrer"
      className="block border rounded-lg overflow-hidden hover:opacity-80"
    >
      <img src={`${API_URL}/${path}`} alt={label} className="w-full h-24 object-cover" />
      <p className="text-xs text-center py-1 text-muted-foreground">{label}</p>
    </a>
  );
}

export default function AgentDetailDialog({
  agentId,
  open,
  onClose,
  onChanged,
}: {
  agentId: number | null;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const dispatch = useDispatch();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [commissionRate, setCommissionRate] = useState("");

  useEffect(() => {
    if (!open || !agentId) return;
    setLoading(true);
    getAgentById(agentId)
      .then((data) => {
        setAgent(data);
        setCommissionRate(String(data.commissionRate ?? 0));
      })
      .finally(() => setLoading(false));
  }, [open, agentId]);

  const refresh = async () => {
    if (!agentId) return;
    const data = await getAgentById(agentId);
    setAgent(data);
    onChanged();
  };

  const act = async (fn: () => Promise<unknown>, successMessage: string) => {
    try {
      await fn();
      dispatch(showToast({ type: "success", message: successMessage }));
      await refresh();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Action failed.";
      dispatch(showToast({ type: "danger", message }));
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent details</DialogTitle>
        </DialogHeader>

        {loading || !agent ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="font-semibold">{agent.user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{agent.user?.email}</p>
              <p className="text-sm text-muted-foreground">{agent.user?.phoneNumber}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                  {agent.status}
                </Badge>
                <Badge variant={agent.kycStatus === "verified" ? "default" : "secondary"}>
                  KYC: {agent.kycStatus}
                </Badge>
              </div>
              {agent.kycStatus === "rejected" && agent.kycRejectionReason && (
                <p className="text-xs text-destructive mt-1">
                  Rejection reason: {agent.kycRejectionReason}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Cash on hand: </span>
                {Number(agent.cashOnHand).toFixed(2)}
              </div>
              <div>
                <span className="text-muted-foreground">Max limit: </span>
                {Number(agent.maxCashOnHand).toFixed(2)}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">KYC documents</p>
              <div className="grid grid-cols-2 gap-2">
                <DocThumb label="ID front" path={agent.idFrontImage} />
                <DocThumb label="ID back" path={agent.idBackImage} />
                <DocThumb label="Selfie" path={agent.selfieImage} />
                <DocThumb label="Address proof" path={agent.addressProofImage} />
              </div>
            </div>

            {(agent.status === "pending" || agent.kycStatus === "submitted") && (
              <Can anyOf={["update:agent-crm"]}>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">Review application</p>
                  <Textarea
                    placeholder="Rejection reason (required to reject)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => act(() => approveAgent(agent.id, "approved"), "Agent approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={!rejectionReason}
                      onClick={() =>
                        act(
                          () => approveAgent(agent.id, "rejected", rejectionReason),
                          "Agent rejected",
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Can>
            )}

            <Can anyOf={["update:agent-crm"]}>
              <div className="border rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium">Commission rate (%)</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                  <Button
                    onClick={() =>
                      act(
                        () => updateCommission(agent.id, Number(commissionRate)),
                        "Commission rate updated",
                      )
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>

              {(agent.status === "active" || agent.status === "suspended") && (
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  {agent.status === "active" ? (
                    <>
                      <Input
                        placeholder="Suspension reason"
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => act(() => suspendAgent(agent.id, suspendReason), "Agent suspended")}
                      >
                        Suspend agent
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => act(() => activateAgent(agent.id), "Agent activated")}
                    >
                      Reactivate agent
                    </Button>
                  )}
                </div>
              )}
            </Can>

            {(agent.cashTransactions?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent transactions</p>
                <div className="space-y-1">
                  {agent.cashTransactions!.map((t) => (
                    <div key={t.id} className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{t.type.replace("_", " ")}</span>
                      <span>${Number(t.amount).toFixed(2)}</span>
                      <span>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(agent.daySettlements?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent day settlements</p>
                <div className="space-y-1">
                  {agent.daySettlements!.map((s) => (
                    <div key={s.id} className="flex justify-between text-xs text-muted-foreground">
                      <span>{new Date(s.settlementDate).toLocaleDateString()}</span>
                      <span>{s.status}</span>
                      <span>Variance: {Number(s.variance).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
