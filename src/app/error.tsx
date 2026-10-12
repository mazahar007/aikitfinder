"use client";

import Link from "next/link";
import { RotateCcwIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/** Friendly error page. Never shows stack traces or technical details to visitors. */
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="max-w-2xl py-16 text-center sm:py-24">
      <p className="text-sm font-semibold text-destructive">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        This page couldn’t load
      </h1>
      <p className="mt-3 text-muted-foreground">
        It’s probably a temporary problem on our side. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>
          <RotateCcwIcon aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Go to the homepage</Link>
        </Button>
      </div>
    </Container>
  );
}
