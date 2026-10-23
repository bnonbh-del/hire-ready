"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";
import { deleteApplication, updateApplicationStatus } from "./actions";

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  new: "border-accent-500 text-accent-700",
  contacted: "border-line text-ink",
  interview: "border-brand-500 text-brand-700",
  accepted: "border-brand-700 bg-brand-50 text-brand-800",
  rejected: "border-line text-muted",
};

/** Changes the applicant's status as soon as a new one is picked. */
export function StatusSelect({ id, status, name }: { id: string; status: ApplicationStatus; name: string }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`حالة ${name}`}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ApplicationStatus;
          const before = value;
          setValue(next);
          setFailed(false);
          start(async () => {
            const result = await updateApplicationStatus(id, next);
            if (!result.ok) {
              setValue(before);
              setFailed(true);
            }
          });
        }}
        className={`rounded-md border bg-card px-2 py-1.5 text-sm ${STATUS_STYLE[value]}`}
      >
        {Object.entries(APPLICATION_STATUSES).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {failed && <span className="text-xs text-danger">ما انحفظ</span>}
    </div>
  );
}

export function DeleteApplicationButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`حذف طلب ${name}`}
      title="حذف الطلب"
      className="rounded-md p-1.5 text-muted hover:bg-danger-50 hover:text-danger"
      onClick={() => {
        if (!confirm(`تحذف طلب ${name} وسيرته الذاتية نهائياً؟`)) return;
        start(async () => {
          await deleteApplication(id);
          router.refresh();
        });
      }}
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
