"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { TAGS } from "@/lib/cache-tags";

export type FounderFormState = { ok?: boolean; error?: string };

export async function updateFounder(_prev: FounderFormState, form: FormData): Promise<FounderFormState> {
  const { supabase } = await requireAdmin();

  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();
  const bio = String(form.get("bio") ?? "").trim();
  const name_en = String(form.get("name_en") ?? "").trim();
  const role_en = String(form.get("role_en") ?? "").trim();
  const bio_en = String(form.get("bio_en") ?? "").trim();
  let linkedin = String(form.get("linkedin_url") ?? "").trim();

  if (!name || !role) return { error: "الاسم والمنصب مطلوبين." };
  if (bio.length > 600 || bio_en.length > 600) return { error: "النبذة طويلة، خليها أقل من 600 حرف." };
  if (linkedin && !/^https?:\/\//.test(linkedin)) linkedin = `https://${linkedin}`;
  if (linkedin && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) {
    return { error: "رابط لينكدإن لازم يبدي بـ https://www.linkedin.com/" };
  }

  const { error } = await supabase
    .from("founders")
    .update({ name, role, bio, name_en: name_en || null, role_en: role_en || null, bio_en, linkedin_url: linkedin || null })
    .eq("id", id);
  if (error) return { error: "ما انحفظ. حاول مرة ثانية." };

  updateTag(TAGS.founders);
  return { ok: true };
}

/**
 * Sets (or clears, with null) one of a founder's two photos after the browser
 * uploaded it to the public bucket. `kind`: "photo" = the real colours,
 * "duotone" = the brand-colour version shown first. A replaced uploaded file
 * is deleted (files under /founders/ in the site itself are left alone).
 */
export async function setFounderPhoto(id: string, kind: "photo" | "duotone", path: string | null): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();
  if (path !== null && !/^founders\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path)) return { ok: false, error: "مسار الصورة مو صحيح." };
  const column = kind === "photo" ? "photo_path" : "photo_duotone_path";

  const { data: before } = await supabase.from("founders").select(column).eq("id", id).single<Record<string, string | null>>();
  const { error } = await supabase.from("founders").update({ [column]: path }).eq("id", id);
  if (error) return { ok: false, error: "ما انحفظت الصورة. حاول مرة ثانية." };

  const old = before?.[column];
  if (old && old !== path && !old.startsWith("/")) await supabase.storage.from("public").remove([old]);

  updateTag(TAGS.founders);
  return { ok: true };
}
