"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import { LinkedInIcon } from "@/components/icons";

export interface FounderCardData {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  linkedin: string | null;
  /** The real photo. */
  photo: string | null;
  /** The same photo in the brand colours; shown first. */
  duotone: string | null;
}

const MAX_TILT = 6; // degrees

/*
 * Tall (4:5) founder cards. The photo starts in the brand duotone and fades
 * to the real colours (600ms) while it grows 4%:
 *   - with a mouse: on hover, and the card tilts a little with the pointer
 *     (max 6°) while the bio slides up;
 *   - on touch screens: when the card reaches the middle of the screen, and
 *     the bio is always shown.
 * Styles: `.founder-card` in globals.css. Under prefers-reduced-motion there's
 * no tilt or zoom, and the colours switch without a fade.
 * Must sit inside a RevealGroup (each card has `reveal`, so they come in one by one).
 */
export function FounderCards({ founders, linkedinLabel }: { founders: FounderCardData[]; linkedinLabel: string }) {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 md:gap-8">
      {founders.map((f) => (
        <FounderCard key={f.id} founder={f} linkedinLabel={linkedinLabel} />
      ))}
    </div>
  );
}

function FounderCard({ founder, linkedinLabel }: { founder: FounderCardData; linkedinLabel: string }) {
  const ref = useRef<HTMLElement>(null);

  // Touch screens: colour the photo while the card is in the middle band of the screen.
  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        card.dataset.active = String(entry.isIntersecting);
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  function tilt(event: PointerEvent<HTMLElement>) {
    const card = ref.current;
    if (!card || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5; // -0.5 … 0.5
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-y * 2 * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 2 * MAX_TILT).toFixed(2)}deg`);
  }

  function reset() {
    ref.current?.style.removeProperty("--tilt-x");
    ref.current?.style.removeProperty("--tilt-y");
  }

  const realPhoto = founder.photo ?? founder.duotone;
  const firstPhoto = founder.duotone ?? founder.photo;

  return (
    <article ref={ref} onPointerMove={tilt} onPointerLeave={reset} data-active="false" className="founder-card reveal group">
      <div className="founder-card-inner relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-navy shadow-xl shadow-black/20">
        {firstPhoto && (
          <Image
            src={firstPhoto}
            alt={founder.duotone ? "" : founder.name}
            fill
            quality={90}
            sizes="(min-width: 768px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="founder-photo object-cover object-top"
          />
        )}
        {founder.duotone && realPhoto && (
          <Image
            src={realPhoto}
            alt={founder.name}
            fill
            quality={90}
            sizes="(min-width: 768px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="founder-photo founder-photo-real object-cover object-top"
          />
        )}

        {/* Dark gradient so the white text stays readable over any photo. */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-navy via-navy/75 to-transparent" aria-hidden="true" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-on-navy">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl font-bold">{founder.name}</h3>
              <p className="mt-1 font-medium text-accent-500">{founder.role}</p>
            </div>
            {founder.linkedin && (
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${linkedinLabel}: ${founder.name}`}
                title={linkedinLabel}
                className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-on-navy/30 text-on-navy transition-colors hover:border-accent-500 hover:text-accent-500"
              >
                <LinkedInIcon size={18} />
              </a>
            )}
          </div>
          {founder.bio && (
            <div className="founder-bio">
              <p className="overflow-hidden text-sm leading-7 text-on-navy-soft">
                <span className="block pt-3">{founder.bio}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
