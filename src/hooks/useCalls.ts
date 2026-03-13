import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Call = {
  id: string;
  created_at: string | null;
  team_member: string;
  file_name: string;
  file_url: string | null;
  transcription: string | null;
  score: number | null;
  feedback: string | null;
  suggestions: string | null;
  status: string | null;
  duration: string | null;
  input_type: string | null;
};

export function useCalls() {
  return useQuery({
    queryKey: ["calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Call[];
    },
  });
}

export function useCall(id: string) {
  return useQuery({
    queryKey: ["calls", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Call;
    },
    enabled: !!id,
  });
}

export function useDeleteCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast({ title: "Chamada excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Falha ao excluir chamada", variant: "destructive" });
    },
  });
}

export function useCreateCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (call: {
      team_member: string;
      file_name: string;
      input_type: string;
      transcription?: string;
      duration?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("calls")
        .insert({ ...call, status: call.status || "processing" })
        .select()
        .single();
      if (error) throw error;
      return data as Call;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
    onError: () => {
      toast({ title: "Falha ao criar registro da chamada", variant: "destructive" });
    },
  });
}
