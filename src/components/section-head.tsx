import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RevealGroup } from "@/components/reveal";
import { RevealWords } from "@/components/reveal-words";

/** Section heading with an optional intro line and "see all" link. */
export function SectionHead({
  id,
  title,
  intro,
  link,
  onNavy = false,
}: {
  id: string;
  title: string;
  /** A line under the heading. */
  intro?: string;
  link?: { href: string; label: string };
  onNavy?: boolean;
}) {
  return (
    <RevealGroup className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <RevealWords id={id} parts={[{ text: title }]} className="text-3xl font-bold md:text-4xl" />
        {intro && <p className={`reveal mt-4 max-w-2xl ${onNavy ? "text-on-navy-soft" : "text-ink-soft"}`}>{intro}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className={`group inline-flex shrink-0 items-center gap-1.5 font-medium ${onNavy ? "text-on-navy" : "text-accent-700"}`}
        >
          {link.label}
          <ArrowLeft
            size={18}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1 ltr:-scale-x-100 ltr:group-hover:translate-x-1"
          />
        </Link>
      )}
    </RevealGroup>
  );
}
