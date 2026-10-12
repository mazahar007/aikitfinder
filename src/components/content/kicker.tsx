import { cn } from "@/lib/utils";

/**
 * The shared section label: an outlined number plus a pill. Used by the story
 * chapters and the regular homepage sections so both feel like one page.
 */
export function Kicker({
  index,
  label,
  inverted = false,
}: {
  index?: number;
  label: string;
  inverted?: boolean;
}) {
  return (
    <p className="flex items-baseline gap-3">
      {index !== undefined ? (
        <span
          aria-hidden="true"
          className={cn(
            "text-5xl font-extrabold tracking-tighter text-transparent sm:text-6xl",
            inverted
              ? "[-webkit-text-stroke:1.5px_var(--on-brand)]"
              : "[-webkit-text-stroke:1.5px_var(--heading)]",
          )}
        >
          {String(index).padStart(2, "0")}
        </span>
      ) : null}
      <span
        className={cn(
          "rounded-full border px-3 py-0.5 text-sm font-semibold tracking-wide uppercase",
          inverted ? "border-on-brand text-on-brand" : "border-heading text-heading",
        )}
      >
        {label}
      </span>
    </p>
  );
}
