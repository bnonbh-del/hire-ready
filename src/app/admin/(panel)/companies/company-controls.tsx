"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { buttonPrimary, hintClass, inputClass, labelClass } from "@/components/ui";
import { uploadPublicImage } from "@/lib/admin/upload-image";
import { addCompany, deleteCompany, setCompanyActive } from "./actions";

export function AddCompanyForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);

    let logo_path: string | null = null;
    if (logo) {
      const uploaded = await uploadPublicImage(logo, "logos");
      if ("error" in uploaded) {
        setSaving(false);
        return setError(uploaded.error);
      }
      logo_path = uploaded.path;
    }

    const result = await addCompany({
      name: String(form.get("name") ?? ""),
      name_en: String(form.get("name_en") ?? ""),
      website: String(form.get("website") ?? ""),
      logo_path,
    });
    setSaving(false);
    if (!result.ok) return setError(result.error ?? "صار خطأ.");

    formRef.current?.reset();
    setLogo(null);
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-card p-5 md:p-6">
      <h2 className="text-lg font-semibold">إضافة شركة</h2>
      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-50 p-3 text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="name" className={labelClass}>
            اسم الشركة
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="name_en" className={labelClass}>
            الاسم بالإنكليزي
          </label>
          <input id="name_en" name="name_en" dir="ltr" className={`${inputClass} text-right`} />
          <p className={hintClass}>اختياري. للصفحات الإنكليزية.</p>
        </div>
        <div>
          <label htmlFor="website" className={labelClass}>
            موقع الشركة
          </label>
          <input id="website" name="website" dir="ltr" placeholder="https://" className={`${inputClass} text-right`} />
          <p className={hintClass}>اختياري.</p>
        </div>
      </div>
      <div>
        <span className={labelClass}>الشعار</span>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-card px-4 py-3 hover:border-brand-500">
          <ImagePlus size={18} className="text-brand-700" aria-hidden="true" />
          <span className="max-w-64 truncate">{logo ? logo.name : "اختر صورة الشعار"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className={hintClass}>يفضّل PNG بخلفية شفافة أو بيضاء.</p>
      </div>
      <button type="submit" disabled={saving} className={buttonPrimary}>
        {saving && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
        إضافة
      </button>
    </form>
  );
}

export function CompanyRowControls({ id, name, active }: { id: string; name: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await setCompanyActive(id, e.target.checked);
              router.refresh();
            })
          }
          className="size-4 accent-primary"
        />
        تظهر بصفحة الشركاء
      </label>
      <button
        type="button"
        disabled={pending}
        aria-label={`حذف ${name}`}
        className="rounded-md p-1.5 text-muted hover:bg-danger-50 hover:text-danger"
        onClick={() => {
          if (!confirm(`تحذف ${name}؟`)) return;
          start(async () => {
            await deleteCompany(id);
            router.refresh();
          });
        }}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
