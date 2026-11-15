import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthButton } from "@/components/auth/auth-provider";
import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/layout/container";
import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { products } from "@/config/products";
import { authStatus } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const productHome = { directory: products.directory, autoflow: products.autoflow } as const;
const workspaceHref = { directory: products.directory.home, autoflow: "/autoflow/app" } as const;

const notices: Record<string, { tone: "success" | "error"; text: string }> = {
  confirmed: { tone: "success", text: "Your email is confirmed and you are signed in." },
  "password-updated": {
    tone: "success",
    text: "Your password has been updated. Other devices were signed out.",
  },
  "link-invalid": {
    tone: "error",
    text: "That confirmation link has expired or was already used. Log in, or sign up again to get a new link.",
  },
};

function Notice({ code }: { code: string | undefined }) {
  const notice = code ? notices[code] : undefined;
  if (!notice) return null;
  return (
    <p
      role={notice.tone === "error" ? "alert" : "status"}
      className={
        notice.tone === "error"
          ? "mb-8 rounded-xl border border-destructive/40 bg-destructive-tint px-4 py-3 text-sm"
          : "mb-8 rounded-xl border border-success/40 bg-success-tint px-4 py-3 text-sm"
      }
    >
      {notice.text}
    </p>
  );
}

async function AccountDetails({
  searchParams,
}: {
  searchParams: PageProps<"/account">["searchParams"];
}) {
  const user = await getCurrentUser();
  const code = (await searchParams).notice;
  const notice = <Notice code={typeof code === "string" ? code : undefined} />;

  if (!user) {
    return (
      <>
        {notice}
        <h1 className="font-display text-4xl font-light tracking-tight text-heading">
          Your account
        </h1>
        <p className="mt-3 text-muted-foreground">
          {authStatus.enabled ? "Log in to see your account." : authStatus.reason}
        </p>
        {authStatus.enabled ? (
          <div className="mt-8 flex gap-3">
            <AuthButton mode="login" returnTo="/account" className="btn btn-af">
              Log in
            </AuthButton>
            <AuthButton mode="signup" returnTo="/account" className="btn btn-ghost">
              Sign up
            </AuthButton>
          </div>
        ) : null}
      </>
    );
  }

  // Runs as the signed-in user: row level security returns only their workspaces.
  const supabase = await createSupabaseServerClient();
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, product, name")
    .order("product");

  return (
    <>
      {notice}
      <h1 className="font-display text-4xl font-light tracking-tight text-heading">Your account</h1>
      <p className="mt-3 text-muted-foreground">
        One account for the {products.directory.name} and {products.autoflow.name}.
      </p>

      <dl className="mt-8 grid gap-5 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Email
          </dt>
          <dd className="mt-1 break-words text-foreground">{user.email}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Display name
          </dt>
          <dd className="mt-1 text-foreground">{user.displayName ?? "Not set"}</dd>
        </div>
      </dl>

      <h2 className="mt-10 font-display text-2xl font-normal tracking-tight text-heading">
        Your workspaces
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {(workspaces ?? []).map((w) => {
          const product = w.product as keyof typeof productHome;
          return (
            <li key={w.id}>
              <Link
                href={workspaceHref[product]}
                className="block rounded-2xl border bg-card p-5 hover:border-primary"
              >
                <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  {productHome[product].name}
                </span>
                <span className="mt-1 block text-lg text-heading">{w.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <LogoutButton className="btn btn-ghost mt-10" />
    </>
  );
}

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <Container className="max-w-3xl py-12 sm:py-16">
          <Suspense
            fallback={
              <p role="status" className="py-16 text-center text-muted-foreground">
                Loading your account…
              </p>
            }
          >
            <AccountDetails searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
      <ParentFooter />
    </>
  );
}
