import { Search } from "lucide-react";
import { SelectField } from "@/components/job-search-form";
import { buttonPrimary } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { governorateLabel, localePath, t, type Locale } from "@/lib/i18n";

/*
 * The home page search: job title + governorate, a plain GET form to /jobs
 * (works without JavaScript). The labels sit inside the fields and float up
 * when the field is focused or filled (CSS only, `peer`).
 */
export function HeroSearch({ locale }: { locale: Locale }) {
  const d = t(locale).search;

  return (
    <form
      action={localePath(locale, "/jobs")}
      method="get"
      role="search"
      className="grid gap-3 rounded-2xl bg-card p-3 shadow-lg shadow-black/15 md:grid-cols-[1.6fr_1fr_auto] md:p-3.5"
    >
      <div className="relative">
        <input
          id="hero-q"
          name="q"
          type="search"
          placeholder={d.titleExample}
          className="peer block w-full rounded-xl border border-field bg-card px-4 pb-2 pt-6 text-base text-ink placeholder:text-transparent focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:placeholder:text-muted"
        />
        <label
          htmlFor="hero-q"
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 font-medium text-muted transition-all duration-200 ease-out peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {d.title}
        </label>
      </div>

      <SelectField id="hero-gov" name="gov" label={d.governorate} value="">
        <option value="">{d.allGovernorates}</option>
        {GOVERNORATES.map((g) => (
          <option key={g} value={g}>
            {governorateLabel(g, locale)}
          </option>
        ))}
      </SelectField>

      <button type="submit" className={`${buttonPrimary} md:px-8`}>
        <Search size={18} aria-hidden="true" />
        {d.submit}
      </button>
    </form>
  );
}
