import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import type { Settings } from "@/lib/types";
import { CleanUpButton, SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "الإعدادات" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">الإعدادات</h1>
      <p className="mt-1 text-ink-soft">معلومات التواصل اللي تطلع بالموقع.</p>
      <div className="mt-6 max-w-3xl space-y-6">
        <Suspense fallback={<div className="h-96 rounded-2xl bg-card" />}>
          <SettingsLoader />
        </Suspense>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-semibold">صيانة</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            إذا متقدم رفع سيرته وطلع قبل ما يكمّل، يبقى الملف بالمخزن بدون طلب. هذا الزر يحذف هالملفات (اللي صار عليها
            أكثر من يوم).
          </p>
          <CleanUpButton />
        </section>
      </div>
    </>
  );
}

async function SettingsLoader() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
  return <SettingsForm settings={data as Settings} />;
}
