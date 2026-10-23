"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buttonDanger, buttonSmallSecondary } from "@/components/ui";
import type { JobStatus } from "@/lib/constants";
import { deleteJob, setJobStatus } from "./actions";

/** Close an open job, or reopen a closed one. */
export function ToggleJobStatus({ id, status }: { id: string; status: JobStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (status === "draft") return null;
  const next: JobStatus = status === "open" ? "closed" : "open";

  return (
    <button
      type="button"
      disabled={pending}
      className={buttonSmallSecondary}
      onClick={() => {
        if (next === "closed" && !confirm("تسكّر التقديم على هذي الوظيفة؟ صفحتها تبقى موجودة.")) return;
        start(async () => {
          await setJobStatus(id, next);
          router.refresh();
        });
      }}
    >
      {pending ? "..." : next === "closed" ? "إغلاق" : "إعادة فتح"}
    </button>
  );
}

export function DeleteJobButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={buttonDanger}
      onClick={() => {
        if (!confirm("تحذف الوظيفة نهائياً؟ ما يرجع.")) return;
        start(async () => {
          const result = await deleteJob(id);
          if (!result.ok) return alert(result.message);
          router.push("/admin/jobs");
          router.refresh();
        });
      }}
    >
      {pending ? "جاري الحذف..." : "حذف الوظيفة"}
    </button>
  );
}
