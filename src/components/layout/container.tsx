import * as React from "react";

import { cn } from "@/lib/utils";

/** Centres page content: 16px gutters on phones, capped at 1200px on desktop. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
