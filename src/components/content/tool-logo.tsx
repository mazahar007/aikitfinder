import { cn } from "@/lib/utils";

const tones = [
  "bg-primary-tint text-primary-hover",
  "bg-learn-tint text-learn",
  "bg-surface-subtle text-heading",
];

/**
 * Placeholder mark built from the tool's initials. Real logos are only shown
 * when the vendor permits it (master brief, section 10), so we never invent one.
 */
export function ToolLogo({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tone = tones[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % tones.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-bold",
        size === "lg" ? "size-16 text-xl" : "size-11 text-sm",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}
