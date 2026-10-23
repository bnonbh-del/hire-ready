import Image from "next/image";
import { Languages } from "lucide-react";
import type { ReactNode } from "react";
import { RevealWords } from "@/components/reveal-words";

export const wide = "mx-auto w-full max-w-6xl px-4";

/*
 * The navy band at the top of every inner page, with the big faint HR mark
 * drifting behind it. `title` comes in word by word on load (CSS only), unless
 * `heading` replaces it (job titles: they carry their own language/direction).
 */
export function PageHero({
  title,
  heading,
  intro,
  children,
  className = "",
}: {
  title?: string;
  heading?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-navy text-on-navy ${className}`}>
      <Image
        src="/logo/hr-mark-white.png"
        alt=""
        width={366}
        height={300}
        priority
        className="pointer-events-none absolute -top-8 -z-10 w-72 opacity-[0.06] ltr:-right-16 rtl:-left-16 md:-top-14 md:w-[30rem]"
      />
      <div className={`${wide} pb-12 pt-10 md:pb-16 md:pt-14`}>
        {heading ?? (title && <RevealWords as="h1" on="load" parts={[{ text: title }]} className="max-w-4xl text-[2rem] font-bold leading-tight md:text-5xl" />)}
        {intro && <div className="mt-4 max-w-2xl text-on-navy-soft md:text-lg">{intro}</div>}
        {children}
      </div>
    </section>
  );
}

/** "Available in Arabic only": a job shown in the other language because the page language has no version. */
export function OtherLanguageNote({ text }: { text: string }) {
  return (
    <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-on-navy/25 px-3 py-1 text-sm text-on-navy-soft">
      <Languages size={16} aria-hidden="true" />
      {text}
    </p>
  );
}
