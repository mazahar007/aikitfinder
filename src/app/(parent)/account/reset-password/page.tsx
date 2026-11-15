import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { RequestResetLinkButton, ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Container } from "@/components/layout/container";
import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { authStatus, RECOVERY_COOKIE } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
  // The address may carry nothing sensitive by the time this page loads, but
  // never send it on to other sites.
  referrer: "no-referrer",
};

const heading = "font-display text-4xl font-light tracking-tight text-heading";

async function ResetPassword() {
  const user = await getCurrentUser();
  const recovery = (await cookies()).get(RECOVERY_COOKIE)?.value;

  // The form is offered only in a session opened by a reset link a few minutes ago.
  if (!user || recovery !== user.id) {
    return (
      <>
        <h1 className={heading}>This reset link is not valid</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {authStatus.enabled
            ? "The link has expired, was already used, or was opened too long ago. Reset links work once and for one hour. Request a new one to continue."
            : authStatus.reason}
        </p>
        {authStatus.enabled ? <RequestResetLinkButton className="btn btn-af mt-8" /> : null}
      </>
    );
  }

  return (
    <>
      <h1 className={heading}>Choose a new password</h1>
      <p className="mt-3 max-w-xl break-words text-muted-foreground">
        For {user.email}. After you save it, other devices signed in to this account are signed out.
      </p>
      <ResetPasswordForm />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <Container className="max-w-3xl py-12 sm:py-16">
          <Suspense
            fallback={
              <p role="status" className="py-16 text-center text-muted-foreground">
                Checking your reset link…
              </p>
            }
          >
            <ResetPassword />
          </Suspense>
        </Container>
      </main>
      <ParentFooter />
    </>
  );
}
