"use client";

import * as React from "react";

/**
 * Submits a form to a server action without React's automatic reset, so the
 * fields keep what the person typed when the server refuses a value. The
 * button that was pressed is included, as with a normal submit.
 */
export function keepValues(dispatch: (form: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const form = new FormData(event.currentTarget, submitter);
    React.startTransition(() => dispatch(form));
  };
}
