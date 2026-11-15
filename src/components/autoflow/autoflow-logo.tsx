import Link from "next/link";

import { LogoMark } from "@/components/layout/logo";
import { products } from "@/config/products";
import { cn } from "@/lib/utils";

/** The shared AIKitFinder mark with the AutoFlow AI wordmark. */
export function AutoflowLogo({
  href = products.autoflow.home,
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="AutoFlow AI home"
      className={cn("inline-flex items-center gap-2 rounded-md", className)}
    >
      <LogoMark />
      <span className="font-display text-lg font-medium tracking-tight text-heading">
        AutoFlow <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
