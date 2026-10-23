import { RevealGroup } from "@/components/reveal";

export interface TimelineStep {
  title: string;
  text: string;
}

/**
 * Numbered steps: stacked on phones, side by side once there's room (four or
 * six steps from desktop width, three from tablet width). Used for "شلون نشتغل" (services page) and "شلون تقدّم؟" (home).
 * `onNavy` for a dark section.
 */
export function ProcessTimeline({ steps, onNavy = false }: { steps: readonly TimelineStep[]; onNavy?: boolean }) {
  const few = steps.length <= 3;
  // Full class names (Tailwind only generates classes it can see in the source).
  const columns = few ? "md:grid-cols-3 md:gap-10" : steps.length === 4 ? "lg:grid-cols-4 lg:gap-8" : "lg:grid-cols-6 lg:gap-5";
  return (
    <RevealGroup as="ol" className={`mt-10 grid gap-8 ${columns}`}>
      {steps.map((step, i) => (
        <li key={step.title} className={`reveal flex gap-4 border-t pt-5 ${onNavy ? "border-on-navy/20" : "border-line"} ${few ? "md:flex-col md:gap-2" : "lg:flex-col lg:gap-2"}`}>
          <span className={`text-2xl font-bold leading-none ${onNavy ? "text-accent-500" : "text-brand-700"}`}>{i + 1}</span>
          <div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className={`mt-1 text-[15px] ${onNavy ? "text-on-navy-soft" : "text-ink-soft"}`}>{step.text}</p>
          </div>
        </li>
      ))}
    </RevealGroup>
  );
}
