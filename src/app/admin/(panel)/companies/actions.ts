"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { TAGS } from "@/lib/cache-tags";

function refresh() {
  updateTag(TAGS.companies);
  updateTag(TAGS.jobs); // job pages show the partner's logo
}

export async function addCompany(input: {
  name: string;
  /** Optional English name for the English pages. */
  name_en: string;
  website: string;
  logo_path: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "اكتب اسم الشركة." };

  let website = input.website.trim();
  if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
  if (website && !URL.canParse(website)) return { ok: false, error: "رابط الموقع مو صحيح." };

  const { count } = await supabase.from("companies").select("id", { count: "exact", head: true });
  const { error } = await supabase
    .from("companies")
    .insert({ name, name_en: input.name_en.trim() || null, website: website || null, logo_path: input.logo_path, sort_order: (count ?? 0) + 1 });
  if (error) return { ok: false, error: "ما انضافت الشركة." };

  refresh();
  return { ok: true };
}

export async function setCompanyActive(id: string, is_active: boolean): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("companies").update({ is_active }).eq("id", id);
  if (!error) refresh();
  return { ok: !error };
}

/** Jobs linked to the company keep their company name; only the link is removed. */
export async function deleteCompany(id: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("companies").delete().eq("id", id).select("logo_path").single();
  if (error) return { ok: false };
  if (data?.logo_path) await supabase.storage.from("public").remove([data.logo_path]);
  refresh();
  return { ok: true };
}
