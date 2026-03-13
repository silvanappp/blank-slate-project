import { useState, useMemo } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCards } from "@/components/MetricCards";
import { CallFilters, type Filters } from "@/components/CallFilters";
import { CallsTable } from "@/components/CallsTable";
import { UploadModal } from "@/components/UploadModal";
import { useCalls } from "@/hooks/useCalls";
import { useCallsSubscription } from "@/hooks/useCallsSubscription";

export default function Dashboard() {
  const { data: calls = [], isLoading } = useCalls();
  useCallsSubscription();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    teamMember: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!c.team_member.toLowerCase().includes(s) && !c.file_name.toLowerCase().includes(s)) return false;
      }
      if (filters.teamMember && c.team_member !== filters.teamMember) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.dateFrom && new Date(c.created_at || "") < filters.dateFrom) return false;
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(c.created_at || "") > to) return false;
      }
      return true;
    });
  }, [calls, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitore e avalie as chamadas de vendas da sua equipe</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" /> Enviar Chamada
        </Button>
      </div>

      <MetricCards calls={filtered} isLoading={isLoading} />
      <CallFilters filters={filters} onChange={setFilters} />
      <CallsTable calls={filtered} isLoading={isLoading} />

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
