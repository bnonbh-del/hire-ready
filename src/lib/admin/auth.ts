import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in admin, or null. Uses getUser() (checked with Supabase, not
 * just read from the cookie) and the database's own is_admin(), so being
 * signed in isn't enough: the user must be in the `admins` table.
 */
export async function getAdmin() {
  // Session checks read the clock (token expiry), so they must run per request,
  // never during prerendering; otherwise the check fails and looks like "signed out".
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;

  return { supabase, user };
}

/** For admin pages and actions: the admin, or a redirect to the login page. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
