import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import type { Founder } from "@/lib/types";
import { FounderForm } from "./founder-form";

export const metadata: Metadata = { title: "المؤسسين" };

export default function FoundersAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">المؤسسين</h1>
      <p className="mt-1 text-ink-soft">يطلعون بالرئيسية (قسم &quot;منو ورا Hire Ready&quot;) وبصفحة &quot;من نحن&quot;.</p>
      <Suspense fallback={<div className="mt-6 h-64 rounded-2xl bg-card" />}>
        <Founders />
      </Suspense>
    </>
  );
}

async function Founders() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("founders").select("*").order("sort_order");
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {((data ?? []) as Founder[]).map((f) => (
        <FounderForm key={f.id} founder={f} />
      ))}
    </div>
  );
}
