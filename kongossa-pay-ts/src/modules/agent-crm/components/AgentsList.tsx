import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { useDebounce } from "@/lib/utils";
import { getAllAgents } from "../api";
import AgentDetailDialog from "./AgentDetailDialog";

interface Agent {
  id: number;
  agentCode: string;
  status: string;
  kycStatus: string;
  commissionRate: number;
  user?: { fullName?: string; email?: string; phoneNumber?: string };
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  pending: "secondary",
  suspended: "destructive",
  terminated: "destructive",
};

export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [kycStatus, setKycStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const limit = 10;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchAgents = async (opts?: { page?: number; search?: string }) => {
    const currentPage = opts?.page ?? page;
    const res = await getAllAgents({
      status: status === "all" ? undefined : status,
      kycStatus: kycStatus === "all" ? undefined : kycStatus,
      search: opts?.search ?? search,
      limit,
      offset: (currentPage - 1) * limit,
    });
    setAgents(res.data || []);
    setTotal(res.total || 0);
    setPage(currentPage);
  };

  useEffect(() => {
    fetchAgents({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, kycStatus]);

  useDebounce(search, () => fetchAgents({ page: 1 }), 400);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search by name, email, phone, agent code"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kycStatus} onValueChange={setKycStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="KYC status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="font-medium">{agent.user?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{agent.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{agent.agentCode}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[agent.status] ?? "secondary"}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.kycStatus === "verified" ? "default" : "secondary"}>
                        {agent.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.commissionRate}%</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedId(agent.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No agents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center items-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => fetchAgents({ page: page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => fetchAgents({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      </CardContent>

      <AgentDetailDialog
        agentId={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onChanged={() => fetchAgents()}
      />
    </Card>
  );
}
