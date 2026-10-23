import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { publicImageUrl } from "@/lib/storage";
import type { Company } from "@/lib/types";
import { AddCompanyForm, CompanyRowControls } from "./company-controls";

export const metadata: Metadata = { title: "الشركات المتعاقدة" };

export default function CompaniesAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">الشركات المتعاقدة</h1>
      <p className="mt-1 text-ink-soft">الشركات اللي تضيفها هنا تطلع بصفحة الشركاء. إذا ماكو ولا شركة، القسم يختفي من الموقع.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Suspense fallback={<div className="h-64 rounded-2xl bg-card" />}>
          <CompaniesList />
        </Suspense>
        <div className="lg:order-first">
          <AddCompanyForm />
        </div>
      </div>
    </>
  );
}

async function CompaniesList() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("companies").select("*").order("sort_order").order("created_at");
  const companies = (data ?? []) as Company[];

  if (companies.length === 0) {
    return <p className="rounded-2xl border border-line bg-card p-6 text-ink-soft">ماكو شركات بعد.</p>;
  }

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
      {companies.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-line bg-card">
            {c.logo_path ? (
              <Image src={publicImageUrl(c.logo_path)} alt="" width={56} height={56} unoptimized className="max-h-12 w-auto object-contain" />
            ) : (
              <span className="text-xs text-muted">بدون شعار</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{c.name}</p>
            {c.name_en && (
              <p className="text-sm text-muted" dir="ltr">
                {c.name_en}
              </p>
            )}
            {c.website && (
              <a href={c.website} target="_blank" rel="noopener noreferrer" dir="ltr" className="text-sm text-accent-700 hover:underline">
                {c.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
          <CompanyRowControls id={c.id} name={c.name} active={c.is_active} />
        </li>
      ))}
    </ul>
  );
}
