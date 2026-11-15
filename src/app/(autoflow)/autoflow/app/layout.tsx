import { Suspense } from "react";
import type { Metadata } from "next";

import { SignInGate } from "@/components/autoflow/sign-in-gate";
import { WorkspaceShell } from "@/components/autoflow/workspace-shell";
import { getWorkspaceAccess } from "@/lib/autoflow/access";

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s | AutoFlow AI" },
  // The workspace is private to its owner and has nothing for search engines.
  robots: { index: false, follow: false },
};

/**
 * Every workspace route passes through this check. A signed-out visitor never
 * gets the workspace or its pages: the pages are only rendered inside the
 * shell, after the session has been verified. Where accounts are not
 * configured it renders as a read-only layout preview (see
 * src/lib/autoflow/access.ts).
 */
async function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const access = await getWorkspaceAccess();

  if (access.mode === "signed-out") {
    return (
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <SignInGate />
      </main>
    );
  }

  return (
    <WorkspaceShell
      preview={access.mode === "preview"}
      accountLabel={access.mode === "member" ? access.user.email : undefined}
    >
      {children}
    </WorkspaceShell>
  );
}

function WorkspaceLoading() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
      <p role="status" className="px-4 py-24 text-center text-muted-foreground">
        Opening your workspace…
      </p>
    </main>
  );
}

export default function WorkspaceLayout({ children }: LayoutProps<"/autoflow/app">) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceGate>{children}</WorkspaceGate>
    </Suspense>
  );
}
