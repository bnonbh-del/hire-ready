/** Shared class names so buttons and links look the same everywhere. */

const buttonCore =
  "inline-flex items-center justify-center gap-2 font-medium disabled:cursor-not-allowed disabled:opacity-60";

const buttonSize = "rounded-full px-6 py-3 text-base";

/* Lifts on hover, presses on click, and fills with the logo gradient (`.btn-primary` in globals.css). */
export const buttonPrimary = `${buttonCore} ${buttonSize} btn-primary`;

/** The header's smaller version. */
export const buttonPrimarySmall = `${buttonCore} btn-primary rounded-full px-3.5 py-2 text-sm sm:px-4`;

export const buttonSecondary = `${buttonCore} ${buttonSize} btn-lift border border-line bg-card text-ink hover:border-brand-500 hover:text-brand-700`;

export const buttonSmallSecondary =
  "inline-flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-500 hover:text-brand-700";

export const textLink = "text-accent-700 underline-offset-4 hover:underline";

export const container = "mx-auto w-full max-w-3xl px-4";

export const buttonDanger = `${buttonCore} rounded-md px-5 py-3 text-base border border-danger/40 bg-card text-danger transition-colors hover:bg-danger-50`;

/*
 * Form fields: a border dark enough to see on phones, and the brand
 * green-teal when focused. text-base (16px) also stops iPhones from zooming
 * in when a field is tapped.
 */
export const inputClass =
  "block w-full rounded-md border border-field bg-card px-3 py-2.5 text-base text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 aria-[invalid=true]:border-danger";

export const labelClass = "mb-1.5 block font-medium";

export const hintClass = "mt-1.5 text-sm text-muted";
