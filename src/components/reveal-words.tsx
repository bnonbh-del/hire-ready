export interface TextPart {
  text: string;
  /** Shown in the highlight colour. */
  highlight?: boolean;
}

/**
 * A heading built from parts, some of them highlighted. Fades in with its
 * RevealGroup like the rest of the section (`on="load"`: shown straight away,
 * for the first screen).
 */
export function RevealWords({
  parts,
  as: Tag = "h2",
  on = "scroll",
  id,
  className = "",
}: {
  parts: TextPart[];
  as?: "h1" | "h2" | "h3";
  on?: "scroll" | "load";
  id?: string;
  className?: string;
}) {
  return (
    <Tag id={id} className={`${on === "scroll" ? "reveal" : ""} ${className}`}>
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className="text-highlight">
            {part.text}
          </span>
        ) : (
          part.text
        )
      )}
    </Tag>
  );
}
