import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
function publicKey(value) {
 if (value.startsWith("sb_secret_")) return false;
 try { if (value.split(".").length === 3 && JSON.parse(atob(value.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).role === "service_role") return false; } catch { return false; }
 return !!value;
}
export const isSupabaseConfigured = /^https?:\/\//i.test(supabaseUrl) && publicKey(key);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, key) : null;
export default supabase;
