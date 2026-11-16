import type { Metadata } from "next";

import {
  EmptyRow,
  NotBuilt,
  PageHeader,
  Panel,
  formatDate,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/access";
import { listUsers } from "@/lib/admin/data";
import { roleLabel } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin("users.read");
  const q = (await searchParams).q;
  const search = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const users = await listUsers(search || undefined);

  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts and their staff roles. Private user content is not shown here."
      />
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="user-search" className="sr-only">
          Search by email or user ID
        </label>
        <input
          id="user-search"
          name="q"
          defaultValue={search}
          placeholder="Search by email or user ID"
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
        />
        <button
          type="submit"
          className="h-11 rounded-md border border-input bg-card px-4 text-sm font-semibold text-primary"
        >
          Search
        </button>
      </form>
      <Panel>
        {users.length === 0 ? (
          <EmptyRow>{search ? `No account matches “${search}”.` : "No accounts yet."}</EmptyRow>
        ) : (
          <div className="relative overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Staff role</th>
                  <th className={thClass}>Joined</th>
                  <th className={thClass}>Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className={tdClass}>
                      <span className="font-medium break-all text-foreground">{u.email}</span>
                      <p className="font-mono text-xs text-muted-foreground">{u.id}</p>
                    </td>
                    <td className={tdClass}>
                      <Badge variant={u.confirmed ? "success" : "warning"}>
                        {u.confirmed ? "Confirmed" : "Unconfirmed"}
                      </Badge>
                    </td>
                    <td className={tdClass}>{u.role ? roleLabel[u.role] : "—"}</td>
                    <td className={tdClass}>{formatDate(u.created_at)}</td>
                    <td className={tdClass}>{formatDate(u.last_sign_in_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <NotBuilt>
        Suspending and reactivating accounts, user detail pages and usage summaries.
      </NotBuilt>
    </>
  );
}
