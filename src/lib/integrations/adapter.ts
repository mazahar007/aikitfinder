import "server-only";

import type { IntegrationCategory } from "@/lib/integrations/registry";

/**
 * The contract every provider adapter implements, whatever it connects to.
 * Configuration, credentials, health checks, requests, usage and logging are
 * separate concerns so a provider can be swapped without touching the rest.
 *
 * No adapter is registered yet: no provider has been connected. Until one is,
 * "Test connection" reports that plainly and contacts nothing.
 */

export type AdapterContext = {
  /** Non-secret settings from the integration record. */
  config: Record<string, unknown>;
  /** Decrypts one credential on demand, on the server only. */
  secret: (field: string) => Promise<string | null>;
};

export type HealthResult = { ok: boolean; message: string; latencyMs?: number };

export type UsageRecord = { units: number; unit: string; costUsd?: number; reference?: string };

export interface ProviderAdapter {
  /** Matches a `providers[].value` in the registry. */
  readonly provider: string;
  readonly category: IntegrationCategory;
  /** Checks the settings without contacting the provider. Returns problems, or an empty list. */
  validate(config: Record<string, unknown>): string[];
  /** Contacts the provider with the cheapest real request it offers. */
  healthCheck(context: AdapterContext): Promise<HealthResult>;
}

/** Thrown by adapters; `code` is safe to show, `detail` is for the integration log only. */
export class ProviderError extends Error {
  constructor(
    public readonly code:
      "unauthorized" | "rate_limited" | "unavailable" | "invalid_request" | "unknown",
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
  }
}

const adapters = new Map<string, ProviderAdapter>();

/** Called once per adapter module when real providers are added. */
export function registerAdapter(adapter: ProviderAdapter): void {
  adapters.set(`${adapter.category}:${adapter.provider}`, adapter);
}

export function getAdapter(
  category: IntegrationCategory,
  provider: string | null,
): ProviderAdapter | null {
  return provider ? (adapters.get(`${category}:${provider}`) ?? null) : null;
}
