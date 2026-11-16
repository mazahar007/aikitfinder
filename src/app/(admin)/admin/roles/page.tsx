import type { Metadata } from "next";

import { GrantRoleForm, RevokeRoleButton } from "@/components/admin/role-forms";
import {
  EmptyRow,
  PageHeader,
  Panel,
  formatDate,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { getRoleMatrix, listStaff, listUsers } from "@/lib/admin/data";
import { assignableRoles, roleLabel, roleSummary } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default async function AdminRolesPage() {
  const admin = await requireAdmin("roles.read");
  const canGrant = admin.permissions.has("roles.grant");
  const [staff, matrix, users] = await Promise.all([
    listStaff(),
    getRoleMatrix(),
    canGrant && admin.permissions.has("users.read") ? listUsers() : Promise.resolve([]),
  ]);
  const permissions = [...new Set(matrix.map((m) => m.permission))].sort();
  const has = new Set(matrix.map((m) => `${m.role}:${m.permission}`));
  const candidates = users
    .filter((u) => u.confirmed && u.id !== admin.user.id)
    .map((u) => ({ id: u.id, email: u.email }));

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Staff roles are assigned by a Super Admin only. Nobody can change their own role, and there is no admin sign-up."
      />
      <Panel title="Staff">
        {staff.length === 0 ? (
          <EmptyRow>No staff roles have been assigned.</EmptyRow>
        ) : (
          <div className="relative overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Account</th>
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Assigned</th>
                  <th className={thClass}>Assigned by</th>
                  {canGrant ? <th className={thClass}>Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.user_id}>
                    <td className={`${tdClass} break-all`}>{s.email}</td>
                    <td className={tdClass}>{roleLabel[s.role]}</td>
                    <td className={tdClass}>{formatDate(s.granted_at)}</td>
                    <td className={tdClass}>{s.granted_by_email ?? "Owner bootstrap"}</td>
                    {canGrant ? (
                      <td className={tdClass}>
                        {s.user_id === admin.user.id ? (
                          <span className="text-muted-foreground">You</span>
                        ) : (
                          <RevokeRoleButton userId={s.user_id} email={s.email} />
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {canGrant ? (
        <Panel title="Assign a role">
          <GrantRoleForm candidates={candidates} />
        </Panel>
      ) : null}
      <Panel title="Roles">
        <ul className="divide-y">
          {assignableRoles.map((r) => (
            <li key={r} className="px-4 py-3 text-sm">
              <span className="font-semibold text-foreground">{roleLabel[r]}</span>
              <span className="text-muted-foreground"> — {roleSummary[r]}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Permission matrix">
        <div className="relative overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Permission</th>
                {assignableRoles.map((r) => (
                  <th key={r} className={`${thClass} text-center`}>
                    {roleLabel[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p}>
                  <td className={`${tdClass} font-mono text-xs`}>{p}</td>
                  {assignableRoles.map((r) => (
                    <td key={r} className={`${tdClass} text-center`}>
                      {has.has(`${r}:${p}`) ? (
                        <>
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only">Yes</span>
                        </>
                      ) : (
                        <span className="sr-only">No</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
