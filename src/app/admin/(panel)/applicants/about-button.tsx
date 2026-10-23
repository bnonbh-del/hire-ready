"use client";

import { useRef } from "react";
import { NotebookText, X } from "lucide-react";
import { buttonSmallSecondary } from "@/components/ui";

/** Opens the applicant's "about me" text in a dialog. */
export function AboutButton({ name, about, label }: { name: string; about: string; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={buttonSmallSecondary} onClick={() => dialog.current?.showModal()}>
        <NotebookText size={15} aria-hidden="true" />
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label={`نبذة ${name}`}
        className="m-auto w-[min(36rem,calc(100%-2rem))] rounded-lg border border-line p-0 backdrop:bg-ink/20"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold">نبذة {name}</h2>
          <button type="button" aria-label="إغلاق" className="rounded p-1 text-muted hover:text-ink" onClick={() => dialog.current?.close()}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p dir="auto" className="max-h-[60vh] overflow-y-auto whitespace-pre-line px-5 py-4 leading-8">
          {about}
        </p>
      </dialog>
    </>
  );
}
