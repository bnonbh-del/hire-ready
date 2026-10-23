"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { uploadPublicImage } from "@/lib/admin/upload-image";
import { publicImageUrl } from "@/lib/storage";
import { setFounderPhoto } from "./actions";

type Kind = "photo" | "duotone";

/**
 * The founder's two photos (the site cards show the brand-colour one first
 * and fade to the real one): upload, replace or remove each. Uploads go from
 * the browser straight to Supabase Storage, then the path is saved.
 */
export function FounderPhotos({ id, photo, duotone }: { id: string; photo: string | null; duotone: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PhotoSlot id={id} kind="photo" current={photo} label="الصورة الحقيقية" />
      <PhotoSlot id={id} kind="duotone" current={duotone} label="الصورة الملونة (لون الهوية)" />
      <p className="col-span-2 text-sm text-muted">
        الأنسب صورة طولية 800×1000 (نسبة 4:5) والوجه بالنص من فوك، وحجمها أقل من 5 ميغابايت. بالموقع تطلع الملونة أول، وتتلون للحقيقية لما تأشر عليها.
      </p>
    </div>
  );
}

function PhotoSlot({ id, kind, current, label }: { id: string; kind: Kind; current: string | null; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(path: string | null) {
    const result = await setFounderPhoto(id, kind, path);
    if (!result.ok) setError(result.error ?? "صار خطأ.");
    else router.refresh();
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const uploaded = await uploadPublicImage(file, "founders");
    if ("error" in uploaded) setError(uploaded.error);
    else await save(uploaded.path);
    setBusy(false);
  }

  async function remove() {
    if (!confirm("تشيل هالصورة؟")) return;
    setBusy(true);
    setError(null);
    await save(null);
    setBusy(false);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface">
        {current ? (
          <Image src={publicImageUrl(current)} alt="" fill sizes="200px" className="object-cover object-top" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">ماكو صورة</span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-page/70">
            <LoaderCircle size={24} className="animate-spin text-brand-700" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-sm font-medium hover:border-brand-500">
          <ImagePlus size={16} className="text-brand-700" aria-hidden="true" />
          {current ? "بدّل" : "ارفع"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {current && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-sm text-ink-soft hover:border-danger hover:text-danger"
          >
            <Trash2 size={16} aria-hidden="true" />
            شيل
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
