"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");

  React.useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy}>
      {state === "copied" ? (
        <CheckIcon className="pop-in" aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : label}
      </span>
    </Button>
  );
}
