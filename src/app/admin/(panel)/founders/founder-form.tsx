"use client";

import { useActionState } from "react";
import { buttonPrimary, hintClass, inputClass, labelClass } from "@/components/ui";
import type { Founder } from "@/lib/types";
import { updateFounder, type FounderFormState } from "./actions";
import { FounderPhotos } from "./founder-photos";

export function FounderForm({ founder }: { founder: Founder }) {
  const [state, action, pending] = useActionState<FounderFormState, FormData>(updateFounder, {});
  const id = (field: string) => `${founder.id}-${field}`;

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-card p-5 md:p-6">
      <input type="hidden" name="id" value={founder.id} />
      <p className="font-bold">{founder.name}</p>
      <FounderPhotos id={founder.id} photo={founder.photo_path} duotone={founder.photo_duotone_path} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className={labelClass}>
            الاسم
          </label>
          <input id={id("name")} name="name" defaultValue={founder.name} className={inputClass} required />
        </div>
        <div>
          <label htmlFor={id("role")} className={labelClass}>
            المنصب
          </label>
          <input id={id("role")} name="role" defaultValue={founder.role} className={inputClass} required />
        </div>
      </div>
      <div>
        <label htmlFor={id("bio")} className={labelClass}>
          النبذة
        </label>
        <textarea id={id("bio")} name="bio" rows={4} defaultValue={founder.bio} className={inputClass} />
        <p className={hintClass}>سطرين أو ثلاثة. إذا تركتها فارغة، ما تطلع نبذة بالموقع.</p>
      </div>
      <div className="space-y-4 rounded-md border border-line bg-surface p-4" dir="ltr" lang="en">
        <p className="text-sm font-medium text-ink-soft" dir="rtl" lang="ar">
          بالإنكليزي (للصفحة الإنكليزية). إذا فارغ يطلع العربي.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={id("name_en")} className={labelClass}>
              Name
            </label>
            <input id={id("name_en")} name="name_en" defaultValue={founder.name_en ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor={id("role_en")} className={labelClass}>
              Role
            </label>
            <input id={id("role_en")} name="role_en" defaultValue={founder.role_en ?? ""} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor={id("bio_en")} className={labelClass}>
            Bio
          </label>
          <textarea id={id("bio_en")} name="bio_en" rows={3} defaultValue={founder.bio_en} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor={id("linkedin")} className={labelClass}>
          رابط لينكدإن
        </label>
        <input
          id={id("linkedin")}
          name="linkedin_url"
          dir="ltr"
          defaultValue={founder.linkedin_url ?? ""}
          placeholder="https://www.linkedin.com/in/..."
          className={`${inputClass} text-right`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "جاري الحفظ..." : "حفظ"}
        </button>
        <span aria-live="polite" className="text-sm">
          {state.error ? <span className="text-danger">{state.error}</span> : state.ok && !pending ? <span className="text-brand-700">انحفظ.</span> : null}
        </span>
      </div>
    </form>
  );
}
