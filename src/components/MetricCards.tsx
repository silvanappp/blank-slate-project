import { Phone, TrendingUp, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Call } from "@/hooks/useCalls";

function getScoreColor(score: number) {
  if (score >= 80) return "score-good";
  if (score >= 60) return "score-medium";
  return "score-bad";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-score-good";
  if (score >= 60) return "bg-score-medium";
  return "bg-score-bad";
}

function avgDuration(calls: Call[]): string {
  const withDuration = calls.filter((c) => c.duration);
  if (!withDuration.length) return "—";
  const totalSeconds = withDuration.reduce((sum, c) => {
    const parts = c.duration!.split(":");
    return sum + parseInt(parts[0] || "0") * 60 + parseInt(parts[1] || "0");
  }, 0);
  const avg = Math.round(totalSeconds / withDuration.length);
  const mm = Math.floor(avg / 60).toString().padStart(2, "0");
  const ss = (avg % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function MetricCards({ calls, isLoading }: { calls: Call[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalCalls = calls.length;
  const scored = calls.filter((c) => c.score != null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.score!, 0) / scored.length)
    : 0;
  const now = new Date();
  const monthCalls = calls.filter((c) => {
    const d = new Date(c.created_at || "");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const metrics = [
    { label: "Total Calls", value: totalCalls, icon: Phone, color: "text-primary" },
    {
      label: "Avg Score",
      value: scored.length ? avgScore : "—",
      icon: TrendingUp,
      color: scored.length ? getScoreColor(avgScore) : "text-muted-foreground",
      bg: scored.length ? getScoreBg(avgScore) : "",
    },
    { label: "This Month", value: monthCalls, icon: Calendar, color: "text-primary" },
    { label: "Avg Duration", value: avgDuration(calls), icon: Clock, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${m.bg || "bg-primary/10"}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
