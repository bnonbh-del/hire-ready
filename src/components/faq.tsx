import { ChevronDown } from "lucide-react";
import { RevealGroup } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import { content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

/*
 * "عندك سؤال؟" / "Got questions?": applicants' questions as an accordion.
 * Native <details>/<summary>: opens with a click or the keyboard, works
 * without JavaScript, and screen readers announce it as expandable. The
 * smooth open/close is CSS (`.faq` in globals.css).
 */
export function Faq({ locale, id = "faq-title" }: { locale: Locale; id?: string }) {
  const items = content(locale).faq;
  return (
    <>
      <SectionHead id={id} title={t(locale).home.faq} />
      <RevealGroup className="faq mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {items.map((item) => (
          <details key={item.q} className="reveal group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold transition-colors hover:text-brand-700 md:px-6 md:py-5 md:text-lg [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="flex shrink-0 items-center justify-center text-ink-soft transition-transform duration-300 ease-out group-open:rotate-180">
                <ChevronDown size={18} aria-hidden="true" />
              </span>
            </summary>
            <p className="px-5 pb-5 leading-8 text-ink-soft md:px-6">{item.a}</p>
          </details>
        ))}
      </RevealGroup>
    </>
  );
}
