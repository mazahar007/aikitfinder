"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/admin/access";
import { assignableRoles, type Permission, type PlatformRole } from "@/lib/admin/permissions";
import { getAdapter } from "@/lib/integrations/adapter";
import { integrationByKey, type ConfigField } from "@/lib/integrations/registry";
import { encryptSecret, secretHint, secretStorageConfigured } from "@/lib/integrations/secrets";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminFormState = { error?: string; notice?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DENIED = "You do not have permission to do that.";

/**
 * Checks the caller on the server before anything else. This is the first of
 * two checks: the database function that performs the change checks again.
 */
async function allowed(permission: Permission) {
  const context = await getAdminContext();
  return context?.permissions.has(permission) ? context : null;
}

/** Database messages that are safe and useful to show; anything else becomes a generic sentence. */
function explain(error: { code?: string; message?: string }): string {
  if (error.code === "42501")
    return error.message && error.message !== "not allowed" ? sentence(error.message) : DENIED;
  if (error.code === "22023" || error.code === "23514")
    return sentence(error.message ?? "That value was not accepted.");
  return "The change could not be saved. Try again.";
}
const sentence = (text: string) =>
  (text.charAt(0).toUpperCase() + text.slice(1)).replace(/\.?$/, ".");

function readField(
  field: ConfigField,
  raw: FormDataEntryValue | null,
): { value?: unknown; problem?: string } {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (field.type === "boolean") return { value: text === "on" || text === "true" };
  if (!text) return { value: "" };
  if (text.length > 300) return { problem: `${field.label}: use 300 characters or fewer.` };
  if (field.type === "number") {
    const n = Number(text);
    if (!Number.isFinite(n)) return { problem: `${field.label}: enter a number.` };
    if ((field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max))
      return { problem: `${field.label}: enter a number from ${field.min} to ${field.max}.` };
    return { value: n };
  }
  if (field.type === "select") {
    if (!field.options?.some((o) => o.value === text))
      return { problem: `${field.label}: choose one of the options.` };
    return { value: text };
  }
  if (field.type === "url") {
    try {
      const parsed = new URL(text);
      if (!(field.schemes ?? ["https:", "http:"]).includes(parsed.protocol)) throw new Error();
      // Credentials belong in the credential fields, not in an address.
      if (parsed.username || parsed.password)
        return { problem: `${field.label}: remove the user name and password from the address.` };
    } catch {
      return { problem: `${field.label}: enter a full address.` };
    }
    return { value: text };
  }
  return { value: text };
}

export async function saveIntegration(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("integrations.configure"))) return { error: DENIED };
  const key = String(formData.get("key") ?? "");
  const definition = integrationByKey.get(key);
  if (!definition) return { error: "Unknown integration." };

  const provider = String(formData.get("provider") ?? "");
  if (definition.providers && !definition.providers.some((p) => p.value === provider))
    return { error: "Choose a provider from the list." };

  const config: Record<string, unknown> = {};
  for (const field of definition.fields) {
    const { value, problem } = readField(field, formData.get(`config.${field.key}`));
    if (problem) return { error: problem };
    config[field.key] = value;
  }
  const useReal = formData.get("mode") === "real";
  // A provider named "demo_…" is never a real configuration.
  if (useReal && provider.startsWith("demo_"))
    return { error: "Choose a real provider before saving as a real configuration." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_update_integration", {
    p_key: key,
    p_provider: definition.providers ? provider : null,
    p_config: config,
    p_enabled: formData.get("enabled") === "on",
    p_use_real: useReal,
  });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return {
    notice:
      data === "demo"
        ? "Saved in demo mode. No real provider connection has been established."
        : "Saved as a real configuration. It has not been tested yet.",
  };
}

export async function setIntegrationSecret(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("integrations.secrets.write"))) return { error: DENIED };
  const key = String(formData.get("key") ?? "");
  const field = String(formData.get("field") ?? "");
  const definition = integrationByKey.get(key);
  if (!definition?.secrets.some((s) => s.key === field)) return { error: "Unknown credential." };
  if (!secretStorageConfigured)
    return {
      error:
        "Credential storage is not set up on this server (INTEGRATIONS_ENCRYPTION_KEY). Nothing was saved.",
    };

  // Read once, encrypt, and let it go: the value is never logged, echoed or returned.
  const value = String(formData.get("value") ?? "");
  if (value.length < 8 || value.length > 4096)
    return { error: "Enter the credential (8 to 4,096 characters)." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_integration_secret", {
    p_key: key,
    p_field: field,
    p_ciphertext: encryptSecret(value),
    p_hint: secretHint(value),
  });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return { notice: "Credential saved. It is stored encrypted and cannot be shown again." };
}

export async function clearIntegrationSecret(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("integrations.secrets.write"))) return { error: DENIED };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_clear_integration_secret", {
    p_key: String(formData.get("key") ?? ""),
    p_field: String(formData.get("field") ?? ""),
  });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return { notice: "Credential removed." };
}

export async function testIntegration(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("integrations.configure"))) return { error: DENIED };
  const key = String(formData.get("key") ?? "");
  const definition = integrationByKey.get(key);
  if (!definition) return { error: "Unknown integration." };

  const supabase = await createSupabaseServerClient();
  const { data: records } = await supabase.rpc("admin_list_integrations");
  const record = (
    records as { key: string; is_demo: boolean; provider: string | null }[] | null
  )?.find((r) => r.key === key);
  if (!record) return { error: "Unknown integration." };

  // Nothing is ever reported as a success unless a real request succeeded.
  let message: string;
  if (record.is_demo)
    message = "Demo mode: no connection test was run and no provider was contacted.";
  else if (!getAdapter(definition.category, record.provider))
    message =
      "No connection test exists for this integration yet. Nothing was contacted, and the status is unchanged.";
  else message = "Connection tests are not enabled yet. Nothing was contacted.";

  const { error } = await supabase.rpc("admin_record_integration_test", {
    p_key: key,
    p_ok: null,
    p_message: message,
  });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return { notice: message };
}

export async function grantRole(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("roles.grant"))) return { error: DENIED };
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as PlatformRole;
  if (!UUID.test(userId) || !assignableRoles.includes(role))
    return { error: "Choose a user and a role." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("grant_role", { p_user_id: userId, p_role: role });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return { notice: "Role updated." };
}

export async function revokeRole(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("roles.grant"))) return { error: DENIED };
  const userId = String(formData.get("userId") ?? "");
  if (!UUID.test(userId)) return { error: "Choose a user." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("revoke_role", { p_user_id: userId });
  if (error) return { error: explain(error) };
  revalidatePath("/admin", "layout");
  return { notice: "Role removed." };
}
