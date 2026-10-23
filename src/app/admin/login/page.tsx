import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY } from "@/lib/content";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "دخول لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-dvh items-center overflow-hidden bg-navy px-4 py-16">
      <Image
        src="/logo/hr-mark-white.png"
        alt=""
        width={366}
        height={300}
        className="pointer-events-none absolute -top-16 -z-10 w-[28rem] opacity-[0.06] ltr:-right-24 rtl:-left-24"
      />
      <div className="card-box mx-auto w-full max-w-sm rounded-3xl p-7 shadow-2xl">
        <Image src="/logo/hr-mark.png" alt="" width={59} height={48} className="h-12 w-auto" priority />
        <h1 className="mt-6 text-2xl font-bold">لوحة التحكم</h1>
        <p className="mt-1 text-ink-soft">{COMPANY.name}</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
