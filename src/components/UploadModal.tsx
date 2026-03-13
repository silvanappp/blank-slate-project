import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useCreateCall } from "@/hooks/useCalls";
import { toast } from "@/hooks/use-toast";

const AUDIO_FORMATS = ".mp3,.wav,.m4a,.mp4,.mov,.avi";
const TEXT_FILE_FORMATS = ".docx,.pdf,.txt";
const MAX_AUDIO_SIZE = 999 * 1024 * 1024;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function UploadModal({ open, onOpenChange }: Props) {
  const { data: members } = useTeamMembers();
  const createCall = useCreateCall();

  // Audio state
  const [file, setFile] = useState<File | null>(null);
  const [audioMember, setAudioMember] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Text state
  const [textMember, setTextMember] = useState("");
  const [callName, setCallName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  const [textSubmitting, setTextSubmitting] = useState(false);
  const [textFile, setTextFile] = useState<File | null>(null);
  const textFileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setAudioMember(""); setProgress(0); setUploading(false);
    setTextMember(""); setCallName(""); setTranscript(""); setDuration(""); setTextSubmitting(false);
    setTextFile(null);
  };

  const handleFile = (f: File) => {
    if (f.size > MAX_AUDIO_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 999MB", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const submitAudio = async () => {
    if (!file || !audioMember) {
      toast({ title: "Please select a file and team member", variant: "destructive" });
      return;
    }
    if (!webhookUrl) {
      toast({ title: "N8N webhook URL not configured", variant: "destructive" });
      return;
    }

    setUploading(true); setProgress(10);
    try {
      const call = await createCall.mutateAsync({
        team_member: audioMember,
        file_name: file.name,
        input_type: "audio",
      });
      setProgress(30);

      const formData = new FormData();
      formData.append("callId", call.id);
      formData.append("teamMember", audioMember);
      formData.append("fileName", file.name);
      formData.append("inputType", "audio");
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", webhookUrl);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(30 + Math.round((e.loaded / e.total) * 60));
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setProgress(100);
      toast({ title: "Call uploaded successfully", description: "AI evaluation will begin shortly" });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const submitText = async () => {
    if (!textMember || !callName || (!transcript && !textFile)) {
      toast({ title: "Please fill all fields and provide a transcript or file.", variant: "destructive" });
      return;
    }
    if (!webhookUrl) {
      toast({ title: "N8N webhook URL not configured", variant: "destructive" });
      return;
    }

    setTextSubmitting(true);
    try {
      const call = await createCall.mutateAsync({
        team_member: textMember,
        file_name: textFile ? textFile.name : callName,
        input_type: "text",
        transcription: transcript || undefined,
        duration: duration || undefined,
      });

      const formData = new FormData();
      formData.append("callId", call.id);
      formData.append("teamMember", textMember);
      formData.append("fileName", textFile ? textFile.name : callName);
      formData.append("inputType", "text");
      if (textFile) {
        formData.append("file", textFile);
      }
      if (transcript) formData.append("transcription", transcript);
      if (duration) formData.append("duration", duration);

      const resp = await fetch(webhookUrl, { method: "POST", body: formData });
      if (!resp.ok) throw new Error(`Webhook failed: ${resp.status}`);

      toast({ title: "Transcript submitted", description: "AI evaluation will begin shortly" });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Submission failed", description: String(err), variant: "destructive" });
    } finally {
      setTextSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Call</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="audio" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audio" className="gap-2"><Upload className="h-4 w-4" /> Audio/Video</TabsTrigger>
            <TabsTrigger value="text" className="gap-2"><FileText className="h-4 w-4" /> Text Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4 mt-4">
            <div>
              <Label>Team Member</Label>
              <Select value={audioMember} onValueChange={setAudioMember}>
                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                <SelectContent>
                  {members?.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept={AUDIO_FORMATS} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium truncate max-w-[300px]">{file.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, MP4, MOV, AVI — max 999MB</p>
                </>
              )}
            </div>

            {uploading && <Progress value={progress} className="h-2" />}

            <Button onClick={submitAudio} disabled={uploading || !file || !audioMember} className="w-full">
              {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload & Analyze"}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div>
              <Label>Team Member</Label>
              <Select value={textMember} onValueChange={setTextMember}>
                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                <SelectContent>
                  {members?.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Call Name</Label>
              <Input value={callName} onChange={(e) => setCallName(e.target.value)} placeholder="e.g., Discovery call with Acme Corp" />
            </div>

            <div>
              <Label>Upload Document <span className="text-muted-foreground text-xs">(optional — DOCX, PDF, TXT)</span></Label>
              <div className="flex items-center gap-2 mt-1">
                <input ref={textFileRef} type="file" accept={TEXT_FILE_FORMATS} className="hidden" onChange={(e) => e.target.files?.[0] && setTextFile(e.target.files[0])} />
                <Button variant="outline" size="sm" onClick={() => textFileRef.current?.click()} type="button">
                  <Upload className="h-4 w-4 mr-2" /> Choose File
                </Button>
                {textFile && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="truncate max-w-[200px]">{textFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setTextFile(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Transcript <span className="text-muted-foreground text-xs">(or paste text directly)</span></Label>
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste the full call transcript here..." rows={6} />
            </div>
            <div>
              <Label>Duration <span className="text-muted-foreground text-xs">(optional, MM:SS)</span></Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 15:30" />
            </div>
            <Button onClick={submitText} disabled={textSubmitting || !textMember || !callName || (!transcript && !textFile)} className="w-full">
              {textSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit & Analyze"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
