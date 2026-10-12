import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badges always carry a word (and, for status, an icon) so colour is never
 * the only signal.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-subtle text-muted-foreground",
        info: "border-primary/40 bg-primary-tint text-primary-hover",
        learn: "border-learn/40 bg-learn-tint text-learn",
        success: "border-success/40 bg-success-tint text-success",
        warning: "border-warning/40 bg-warning-tint text-warning",
        destructive: "border-destructive/40 bg-destructive-tint text-destructive",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
