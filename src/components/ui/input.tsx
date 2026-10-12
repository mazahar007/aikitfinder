import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground sm:text-sm",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:bg-surface-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
