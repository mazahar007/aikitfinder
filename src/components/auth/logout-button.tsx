"use client";

import { useAccount } from "@/components/auth/auth-provider";

export function LogoutButton({ className }: { className?: string }) {
  const { signOut, signingOut } = useAccount();
  return (
    <button type="button" className={className} onClick={signOut} disabled={signingOut}>
      {signingOut ? "Logging out…" : "Log out"}
    </button>
  );
}
