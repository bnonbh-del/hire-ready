import Link from "next/link";
import { Search } from "lucide-react";
import { buttonPrimary, textLink } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { departmentLabels, governorateLabel, jobTypeLabels, localePath, t, type Locale } from "@/lib/i18n";
import type { JobFilters } from "@/lib/public-data";

/*
 * The /jobs filters: a plain GET form, so results have a shareable URL and it
 * works without JavaScript. Labels sit inside the fields and float up (CSS
 * only); select labels always sit at the top.
 */
const field =
  "peer block w-full rounded-xl border border-field bg-card px-4 pb-2 pt-6 text-base text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const floating = "pointer-events-none absolute start-4 font-medium text-muted transition-all duration-200 ease-out";

export function JobSearchForm({ values, locale }: { values: Partial<JobFilters>; locale: Locale }) {
  const d = t(locale).search;
  const hasFilters = Boolean(values.q || values.department || values.governorate || values.jobType);

  return (
    <form action={localePath(locale, "/jobs")} method="get" role="search" className="rounded-2xl bg-card p-3 shadow-lg shadow-black/15 md:p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder={d.titleExample}
            className={`${field} placeholder:text-transparent focus:placeholder:text-muted`}
          />
          <label
            htmlFor="search-q"
            className={`${floating} top-1/2 -translate-y-1/2 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs`}
          >
            {d.title}
          </label>
        </div>

        <SelectField id="search-dept" name="dept" label={d.department} value={values.department ?? ""}>
          <option value="">{d.allDepartments}</option>
          {Object.entries(departmentLabels(locale)).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </SelectField>

        <SelectField id="search-gov" name="gov" label={d.governorate} value={values.governorate ?? ""}>
          <option value="">{d.allGovernorates}</option>
          {GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {governorateLabel(g, locale)}
            </option>
          ))}
        </SelectField>

        <SelectField id="search-type" name="type" label={d.jobType} value={values.jobType ?? ""}>
          <option value="">{d.allJobTypes}</option>
          {Object.entries(jobTypeLabels(locale)).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </SelectField>

        <button type="submit" className={`${buttonPrimary} sm:col-span-2 lg:col-span-1`}>
          <Search size={18} aria-hidden="true" />
          {d.submit}
        </button>
      </div>

      {hasFilters && (
        <div className="px-1 pt-3">
          <Link href={localePath(locale, "/jobs")} className={`text-sm ${textLink}`}>
            {d.clear}
          </Link>
        </div>
      )}
    </form>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  children,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue={value} className={`${field} appearance-none pe-10`}>
        {children}
      </select>
      <label htmlFor={id} className={`${floating} top-2 text-xs`}>
        {label}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m5 8 5 5 5-5" />
      </svg>
    </div>
  );
}
