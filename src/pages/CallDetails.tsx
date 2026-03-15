import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, FileText, Type, Clock, User, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCall } from "@/hooks/useCalls";
import { useCallsSubscription } from "@/hooks/useCallsSubscription";

const DOC_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
function hasDocExtension(fileName: string): boolean {
  return DOC_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext));
}

function TypeBadge({ type, fileName }: { type: string | null; fileName: string }) {
  if (type === "audio") {
    return <Badge variant="outline" className="gap-1 border-border/60"><Mic className="h-3 w-3" /> Áudio</Badge>;
  }
  if (type === "text" && hasDocExtension(fileName)) {
    return <Badge variant="outline" className="gap-1 border-border/60"><FileText className="h-3 w-3" /> Documento</Badge>;
  }
  return <Badge variant="outline" className="gap-1 border-border/60"><Type className="h-3 w-3" /> Texto</Badge>;
}

function ScoreDisplay({ score }: { score: number | null }) {
  if (score == null) return null;
  const cls = score >= 80 ? "score-good" : score >= 60 ? "score-medium" : "score-bad";
  const bg = score >= 80 ? "bg-score-good" : score >= 60 ? "bg-score-medium" : "bg-score-bad";
  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 ${bg}`}>
      <span className={`text-3xl font-bold ${cls}`}>{score}</span>
      <span className={`text-sm ${cls} opacity-70`}>/ 100</span>
    </div>
  );
}

export default function CallDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: call, isLoading } = useCall(id || "");
  useCallsSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48 bg-muted/30" />
        <Skeleton className="h-40 w-full bg-muted/30" />
        <Skeleton className="h-60 w-full bg-muted/30" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">Chamada não encontrada</p>
        <Button variant="link" onClick={() => navigate("/")} className="text-primary">Voltar ao Painel</Button>
      </div>
    );
  }

  const isProcessing = call.status === "processing";

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
      </Button>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{call.file_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {call.team_member}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {call.created_at ? format(new Date(call.created_at), "dd/MM/yyyy HH:mm") : "—"}</span>
            {call.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {call.duration}</span>}
            <TypeBadge type={call.input_type} fileName={call.file_name} />
          </div>
        </div>
        <ScoreDisplay score={call.score} />
      </div>

      {isProcessing && (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 py-6">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <div>
              <p className="font-medium text-foreground">Processando chamada...</p>
              <p className="text-sm text-muted-foreground">A avaliação por IA está em andamento. Esta página será atualizada automaticamente.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {call.status === "failed" && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-6">
            <p className="font-medium text-destructive">Processamento falhou</p>
            <p className="text-sm text-muted-foreground">Houve um erro ao avaliar esta chamada. Tente enviar novamente.</p>
          </CardContent>
        </Card>
      )}

      {call.transcription && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Transcrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground font-mono">
              {call.transcription}
            </div>
          </CardContent>
        </Card>
      )}

      {call.feedback && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Feedback da IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {call.feedback}
            </p>
          </CardContent>
        </Card>
      )}

      {call.suggestions && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sugestões de Melhoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {call.suggestions.split(/\n/).filter(Boolean).map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{s.replace(/^\d+\.\s*/, "")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {call.input_type === "audio" && call.file_url && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Reprodução de Áudio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full" src={call.file_url} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
