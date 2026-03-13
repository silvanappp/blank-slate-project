import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCallsSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("calls-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calls" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["calls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
