import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Eye, Play, Download, Trash2, ArrowUpDown, Mic, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Call } from "@/hooks/useCalls";
import { useDeleteCall } from "@/hooks/useCalls";

type SortKey = "created_at" | "team_member" | "score" | "status";
type SortDir = "asc" | "desc";

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-muted-foreground">—</span>;
  const cls = score >= 80 ? "score-good bg-score-good" : score >= 60 ? "score-medium bg-score-medium" : "score-bad bg-score-bad";
  return <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-sm font-semibold ${cls}`}>{score}</span>;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const variants: Record<string, string> = {
    processing: "bg-primary/15 text-primary animate-pulse-slow",
    completed: "bg-score-good score-good",
    failed: "bg-score-bad score-bad",
  };
  return (
    <Badge variant="outline" className={`border-0 ${variants[status] || ""}`}>
      {status}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  const isAudio = type === "audio";
  return (
    <Badge variant="outline" className="gap-1">
      {isAudio ? <Mic className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
      {isAudio ? "Audio" : "Text"}
    </Badge>
  );
}

type Props = {
  calls: Call[];
  isLoading: boolean;
};

export function CallsTable({ calls, isLoading }: Props) {
  const navigate = useNavigate();
  const deleteCall = useDeleteCall();
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...calls].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "created_at") return dir * ((a.created_at || "").localeCompare(b.created_at || ""));
    if (sortKey === "team_member") return dir * a.team_member.localeCompare(b.team_member);
    if (sortKey === "score") return dir * ((a.score ?? -1) - (b.score ?? -1));
    if (sortKey === "status") return dir * ((a.status || "").localeCompare(b.status || ""));
    return 0;
  });

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Mic className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">No calls yet</p>
        <p className="text-sm">Upload your first call to get started</p>
      </div>
    );
  }

  const SortHeader = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8 text-muted-foreground hover:text-foreground" onClick={() => toggleSort(sKey)}>
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead><SortHeader label="Date" sKey="created_at" /></TableHead>
              <TableHead><SortHeader label="Team Member" sKey="team_member" /></TableHead>
              <TableHead>File</TableHead>
              <TableHead><SortHeader label="Score" sKey="score" /></TableHead>
              <TableHead><SortHeader label="Status" sKey="status" /></TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((call) => (
              <TableRow key={call.id} className="hover:bg-accent/50 cursor-pointer" onClick={() => navigate(`/call/${call.id}`)}>
                <TableCell className="text-sm">
                  {call.created_at ? format(new Date(call.created_at), "MMM d, yyyy HH:mm") : "—"}
                </TableCell>
                <TableCell className="font-medium">{call.team_member}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{call.file_name}</TableCell>
                <TableCell><ScoreBadge score={call.score} /></TableCell>
                <TableCell><StatusBadge status={call.status} /></TableCell>
                <TableCell><TypeBadge type={call.input_type} /></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/call/${call.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {call.input_type === "audio" && call.file_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={call.file_url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {call.file_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={call.file_url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete call?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will permanently delete the call record.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCall.mutate(call.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
