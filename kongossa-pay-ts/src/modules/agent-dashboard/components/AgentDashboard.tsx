import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getAllAgents } from "@/modules/agent-crm/api";
import AgentDetailDialog from "@/modules/agent-crm/components/AgentDetailDialog";

// Repurposed as an admin drill-down: search for one specific agent (by name,
// email, phone, or agent code) and open their full detail -- distinct from
// the agent's own self-service dashboard, which lives in kongossa-agent-app.
// The previous version of this page called useAppSelector() inside an async
// useEffect callback, which violates the rules of hooks; that's gone too,
// there's no reason for this admin-facing page to read the agent's own
// Redux auth state at all.
interface AgentResult {
  id: number;
  agentCode: string;
  status: string;
  user?: { fullName?: string; email?: string };
}

export default function AgentDashboard() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await getAllAgents({ search, limit: 10 });
      setResults(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Agent Lookup</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Find a specific agent by name, email, phone, or agent code.
      </p>

      <div className="flex gap-2 max-w-lg">
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <Button onClick={onSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="grid gap-3 max-w-lg">
        {results.map((agent) => (
          <Card
            key={agent.id}
            className="cursor-pointer hover:bg-muted/50 dark:bg-gray-900 dark:border-gray-800"
            onClick={() => setSelectedId(agent.id)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base dark:text-gray-100">
                {agent.user?.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 text-sm text-muted-foreground">
              {agent.user?.email} -- {agent.agentCode} -- {agent.status}
            </CardContent>
          </Card>
        ))}
        {!loading && results.length === 0 && search && (
          <p className="text-sm text-muted-foreground">No agents found.</p>
        )}
      </div>

      <AgentDetailDialog
        agentId={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onChanged={onSearch}
      />
    </div>
  );
}
