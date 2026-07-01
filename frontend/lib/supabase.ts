import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Guard: if env vars are missing, return a no-op stub so the app doesn't crash
// at module load time. Auth features will be unavailable until .env.local is set.
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnon) {
    if (typeof window !== "undefined") {
      console.warn(
        "[LAYA] Supabase env vars missing. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env.local"
      );
    }
    // Return a minimal stub that won't crash — real calls will fail gracefully
    return createClient("https://placeholder.supabase.co", "placeholder-anon-key", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createSupabaseClient();
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnon);
