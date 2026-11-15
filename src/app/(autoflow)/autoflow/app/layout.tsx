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
 * Every workspace route passes through this check. Signed-out visitors never
 * get the workspace; while accounts are closed it renders as a read-only
 * layout preview (see src/lib/autoflow/access.ts).
 */
export default async function WorkspaceLayout({ children }: LayoutProps<"/autoflow/app">) {
  const access = await getWorkspaceAccess();

  if (access.mode === "signed-out") {
    return (
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <SignInGate returnTo="/autoflow/app" />
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
