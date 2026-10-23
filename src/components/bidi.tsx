import { NUMBER_RUN } from "@/lib/job-display";

/**
 * In right-to-left text, "450,000 - 650,000" or "8:00 - 4:00" show reversed.
 * Wrapping each run of numbers in an LTR <bdi> keeps it in the order it was typed.
 */
export function Bidi({ text }: { text: string }) {
  return text.split(NUMBER_RUN).map((part, i) =>
    i % 2 === 1 ? (
      <bdi key={i} dir="ltr">
        {part}
      </bdi>
    ) : (
      part
    )
  );
}
