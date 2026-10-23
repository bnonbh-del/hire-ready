import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase client for public data inside `"use cache"` functions.
 * It never reads cookies, so it always acts as an anonymous visitor (RLS:
 * published jobs, founders, services...) and its results are the same for
 * everyone, which is what makes them safe to cache and share.
 */
export function createPublicClient() {
  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
