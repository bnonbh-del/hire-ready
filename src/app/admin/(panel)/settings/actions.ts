"use server";

import { updateTag } from "next/cache";
import { normalizeIraqiMobile, toLatinDigits } from "@/lib/application-form";
import { requireAdmin } from "@/lib/admin/auth";
import { TAGS } from "@/lib/cache-tags";

export type SettingsState = { ok?: boolean; errors?: Record<string, string> };

function url(value: string, host: RegExp, label: string, errors: Record<string, string>, key: string) {
  let v = value.trim();
  if (!v) return null;
  if (!/^https?:\/\//.test(v)) v = `https://${v}`;
  if (!URL.canParse(v) || !host.test(new URL(v).hostname)) errors[key] = `رابط ${label} مو صحيح.`;
  return v;
}

export async function updateSettings(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  const { supabase } = await requireAdmin();
  const get = (k: string) => String(form.get(k) ?? "");
  const errors: Record<string, string> = {};

  const phone = (key: string) => {
    const raw = get(key).trim();
    if (!raw) return null;
    const normalized = normalizeIraqiMobile(raw);
    if (!normalized) {
      // Landlines and other formats are allowed; just keep digits, spaces and +.
      const cleaned = toLatinDigits(raw).replace(/[^\d+\s]/g, "").trim();
      if (cleaned.replace(/\D/g, "").length < 7) errors[key] = "الرقم مو صحيح.";
      return cleaned;
    }
    return normalized;
  };

  const phone_primary = phone("phone_primary");
  const phone_secondary = phone("phone_secondary");

  // WhatsApp is stored as 9647XXXXXXXXX for wa.me links.
  let whatsapp: string | null = null;
  if (get("whatsapp").trim()) {
    const mobile = normalizeIraqiMobile(get("whatsapp"));
    if (mobile) whatsapp = `964${mobile.slice(1)}`;
    else errors.whatsapp = "اكتب رقم موبايل عراقي، مثل 07734448817.";
  }

  const email = get("email").trim().toLowerCase() || null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "الإيميل مو صحيح.";

  const row = {
    phone_primary,
    phone_secondary,
    whatsapp,
    email,
    address: get("address").trim() || null,
    address_en: get("address_en").trim() || null,
    map_url: url(get("map_url"), /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$|^goo\.gl$/, "الخريطة", errors, "map_url"),
    instagram_url: url(get("instagram_url"), /(^|\.)instagram\.com$/, "إنستغرام", errors, "instagram_url"),
    linkedin_url: url(get("linkedin_url"), /(^|\.)linkedin\.com$/, "لينكدإن", errors, "linkedin_url"),
    telegram_url: url(get("telegram_url"), /^(t\.me|telegram\.me)$/, "قناة التلكرام", errors, "telegram_url"),
  };

  if (Object.keys(errors).length > 0) return { errors };

  const { error } = await supabase.from("settings").update(row).eq("id", 1);
  if (error) return { errors: { form: "ما انحفظت الإعدادات." } };

  updateTag(TAGS.settings);
  return { ok: true };
}

/**
 * Deletes CV files that no application points to: uploads from applicants who
 * left before finishing. Files younger than a day are skipped, in case
 * someone is in the middle of applying.
 */
export async function cleanUpOrphanCvs(): Promise<{ removed: number; error?: string }> {
  const { supabase } = await requireAdmin();
  const bucket = supabase.storage.from("cvs");
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  const { data: folders, error } = await bucket.list("", { limit: 1000 });
  if (error) return { removed: 0, error: "ما كدرت أقرا الملفات." };

  const candidates: string[] = [];
  for (const folder of folders ?? []) {
    if (folder.id) continue; // a file at the top level, not a job folder
    const { data: files } = await bucket.list(folder.name, { limit: 1000 });
    for (const f of files ?? []) {
      if (f.id && f.created_at && Date.parse(f.created_at) < cutoff) candidates.push(`${folder.name}/${f.name}`);
    }
  }
  if (candidates.length === 0) return { removed: 0 };

  const used = new Set<string>();
  for (let i = 0; i < candidates.length; i += 200) {
    const { data } = await supabase.from("applications").select("cv_path").in("cv_path", candidates.slice(i, i + 200));
    for (const row of data ?? []) used.add(row.cv_path);
  }

  const orphans = candidates.filter((p) => !used.has(p));
  if (orphans.length > 0) {
    const { error: removeError } = await bucket.remove(orphans);
    if (removeError) return { removed: 0, error: "ما انحذفت الملفات." };
  }
  return { removed: orphans.length };
}
