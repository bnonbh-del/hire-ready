"use client";

import { useActionState, useState, useTransition } from "react";
import { buttonPrimary, buttonSecondary, hintClass, inputClass, labelClass } from "@/components/ui";
import type { Settings } from "@/lib/types";
import { cleanUpOrphanCvs, updateSettings, type SettingsState } from "./actions";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettings, {});
  const e = state.errors ?? {};
  // Show WhatsApp the way people type it (07...), it's stored as 9647...
  const whatsapp = settings.whatsapp ? `0${settings.whatsapp.replace(/^964/, "")}` : "";

  const field = (name: keyof Settings, label: string, opts: { ltr?: boolean; hint?: string; value?: string } = {}) => (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={opts.value ?? String(settings[name] ?? "")}
        dir={opts.ltr ? "ltr" : undefined}
        className={`${inputClass} ${opts.ltr ? "text-right" : ""}`}
        aria-invalid={!!e[name]}
      />
      {e[name] ? <p className="mt-1.5 text-sm text-danger">{e[name]}</p> : opts.hint && <p className={hintClass}>{opts.hint}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-line bg-card p-5 md:p-6">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-semibold">التواصل</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone_primary", "رقم الهاتف", { ltr: true })}
          {field("phone_secondary", "رقم ثاني", { ltr: true, hint: "اختياري." })}
          {field("whatsapp", "رقم واتساب", { ltr: true, value: whatsapp, hint: "يستخدم لزر واتساب المباشر." })}
          {field("email", "الإيميل", { ltr: true })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("address", "العنوان")}
          {field("address_en", "العنوان بالإنكليزي", { ltr: true, hint: "للصفحات الإنكليزية، مثلاً: Baghdad, Iraq" })}
        </div>
        {field("map_url", "رابط الخريطة", { ltr: true, hint: "اختياري. رابط من خرائط Google." })}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-lg font-semibold">السوشيال</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("instagram_url", "إنستغرام", { ltr: true })}
          {field("linkedin_url", "لينكدإن", { ltr: true })}
          {field("telegram_url", "رابط قناة التلكرام", { ltr: true, hint: "مثلاً: https://t.me/hireready. إذا فارغ، أيقونة تلكرام ما تطلع." })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
        <span aria-live="polite" className="text-sm">
          {e.form ? <span className="text-danger">{e.form}</span> : state.ok && !pending ? <span className="text-brand-700">انحفظت.</span> : null}
        </span>
      </div>
    </form>
  );
}

export function CleanUpButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className={buttonSecondary}
        onClick={() =>
          start(async () => {
            const r = await cleanUpOrphanCvs();
            setResult(r.error ?? (r.removed === 0 ? "ماكو ملفات زايدة." : `انحذف ${r.removed} ملف.`));
          })
        }
      >
        {pending ? "جاري التنظيف..." : "تنظيف ملفات السيفي الزايدة"}
      </button>
      {result && (
        <span className="text-sm text-ink-soft" aria-live="polite">
          {result}
        </span>
      )}
    </div>
  );
}
