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
          <Card key={i} className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full bg-muted/50" />
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
    { label: "Total de Chamadas", value: totalCalls, icon: Phone, color: "text-primary", iconBg: "bg-primary/12" },
    {
      label: "Nota Média",
      value: scored.length ? avgScore : "—",
      icon: TrendingUp,
      color: scored.length ? getScoreColor(avgScore) : "text-muted-foreground",
      iconBg: scored.length ? getScoreBg(avgScore) : "bg-muted/30",
    },
    { label: "Este Mês", value: monthCalls, icon: Calendar, color: "text-primary", iconBg: "bg-primary/12" },
    { label: "Duração Média", value: avgDuration(calls), icon: Clock, color: "text-primary", iconBg: "bg-primary/12" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <Card
          key={m.label}
          className="group border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">{m.label}</p>
                <p className={`text-2xl font-bold mt-1.5 ${m.color}`}>{m.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${m.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
