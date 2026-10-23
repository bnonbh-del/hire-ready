"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * Uploads an image from the admin's browser straight to the public bucket and
 * returns its storage path. Straight to Supabase (not through a server action)
 * because server actions cap request bodies at 1 MB. Storage RLS only lets a
 * signed-in admin upload.
 */
export async function uploadPublicImage(
  file: File,
  folder: "covers" | "logos" | "founders"
): Promise<{ path: string } | { error: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: "الصورة لازم تكون JPG أو PNG أو WEBP أو SVG." };
  if (file.size > MAX_BYTES) return { error: "حجم الصورة أكبر من 5 ميغابايت." };

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createClient()
    .storage.from("public")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return { error: "ما انرفعت الصورة. حاول مرة ثانية." };
  return { path };
}
