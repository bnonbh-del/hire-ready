"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonSmallSecondary } from "@/components/ui";

/** Copies the link; for 2 seconds the icon becomes ✓ and the label says it's copied. */
export function CopyLinkButton({ url, label, copiedLabel }: { url: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / non-HTTPS: fall back to a hidden text field.
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`${buttonSmallSecondary} btn-lift rounded-full ${copied ? "border-brand-500 text-brand-700" : ""}`}
    >
      {copied ? <Check size={16} aria-hidden="true" className="check-pop" /> : <Link2 size={16} aria-hidden="true" />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
