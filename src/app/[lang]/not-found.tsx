import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { localePath, t } from "@/lib/i18n";
import { lang } from "next/root-params";

/* Shown when a page calls notFound() (e.g. a job link that no longer exists). */
export default async function NotFound() {
  const value = await lang();
  const locale = value === "en" ? "en" : "ar";
  const d = t(locale).notFound;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-bold md:text-4xl">{d.title}</h1>
      <p className="mt-3 text-ink-soft">{d.text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={localePath(locale, "/")} className={buttonPrimary}>
          {d.home}
        </Link>
        <Link href={localePath(locale, "/jobs")} className={buttonSecondary}>
          {d.jobs}
        </Link>
      </div>
    </main>
  );
}
