import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Can } from "@/components/custom/Can";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import { getFloatRequests, reviewFloatRequest } from "../api";

interface FloatRequest {
  id: number;
  amount: number;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  agent?: { fullName?: string; email?: string };
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
};

export default function FloatRequestsList() {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState<FloatRequest[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getFloatRequests({ status: status === "all" ? undefined : status })
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const review = async (id: number, newStatus: "approved" | "rejected") => {
    try {
      await reviewFloatRequest(id, newStatus);
      dispatch(
        showToast({ type: "success", message: `Float request ${newStatus}` }),
      );
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Action failed.";
      dispatch(showToast({ type: "danger", message }));
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No float requests found.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.agent?.fullName}</div>
                    <div className="text-xs text-muted-foreground">{r.agent?.email}</div>
                  </TableCell>
                  <TableCell>
                    {Number(r.amount).toFixed(2)} {r.currency}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {r.notes || "--"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[r.status] ?? "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <Can anyOf={["update:agent-crm"]}>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => review(r.id, "approved")}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => review(r.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      </Can>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
