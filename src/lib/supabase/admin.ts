import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase client with the secret key. It bypasses RLS, so it must only run on
 * the server ("server-only" makes the build fail if a client file imports it).
 * Used for the one write visitors are allowed: submitting an application,
 * after the server has validated the form and the CV.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
