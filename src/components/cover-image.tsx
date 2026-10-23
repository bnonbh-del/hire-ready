"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The job cover. If an uploaded cover can't load (deleted file, bad upload),
 * it switches to the generated cover, so a broken-image icon never shows.
 */
export function CoverImage({ src, fallbackSrc, className }: { src: string; fallbackSrc: string; className?: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt=""
      width={1200}
      height={630}
      unoptimized
      priority
      onError={() => current !== fallbackSrc && setCurrent(fallbackSrc)}
      className={className}
    />
  );
}
