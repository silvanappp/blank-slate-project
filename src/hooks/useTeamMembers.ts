import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type TeamMember = {
  id: string;
  name: string;
  created_at: string | null;
};

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as TeamMember[];
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("team_members").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Team member added" });
    },
    onError: () => {
      toast({ title: "Failed to add team member", variant: "destructive" });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Team member removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove team member", variant: "destructive" });
    },
  });
}
