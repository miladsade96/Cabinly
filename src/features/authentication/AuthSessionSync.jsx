import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import supabase from "../../services/supabase.js";
export default function AuthSessionSync() {
 const queryClient = useQueryClient();
 useEffect(() => {
  let lastId; let active = true;
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
   const id = session?.user?.id;
   const changed = lastId !== undefined && lastId !== id;
   lastId = id || null;
   setTimeout(() => { if (!active) return; if (event === "SIGNED_OUT" || changed) queryClient.clear(); else if (event !== "INITIAL_SESSION") void queryClient.invalidateQueries({ queryKey: ["user"] }); }, 0);
  });
  return () => { active = false; subscription.unsubscribe(); };
 }, [queryClient]);
 return null;
}
