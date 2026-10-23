"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  if (!(status in APPLICATION_STATUSES)) return { ok: false };
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  return { ok: !error };
}

/** Deletes the application and its CV file (if it has one). */
export async function deleteApplication(id: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("applications").delete().eq("id", id).select("cv_path").single();
  if (error || !data) return { ok: false };
  if (data.cv_path) await supabase.storage.from("cvs").remove([data.cv_path]);
  return { ok: true };
}
