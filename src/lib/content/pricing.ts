import { billingIntervalLabel } from "@/lib/content/labels";
import type { PricingPlan, Tool, ToolPricing } from "@/lib/content/types";

/** Prices not re-checked for this many days are shown with an "out of date?" warning. */
export const PRICING_STALE_AFTER_DAYS = 60;

/** Budget filter options: highest monthly price in USD. */
export const BUDGET_OPTIONS = [10, 25, 50] as const;

export type PricingFreshness =
  /** Verified and checked recently: figures may be shown as current. */
  | "current"
  /** Verified once, but not checked recently: figures may be out of date. */
  | "stale"
  /** Not verified: figures are not shown at all. */
  | "unverified"
  /** No pricing record yet. */
  | "none";

function daysBetween(fromIso: string, toIso: string) {
  const ms = Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  return Math.floor(ms / 86_400_000);
}

/** `today` is an ISO date (YYYY-MM-DD) so these functions stay pure and testable. */
export function pricingFreshness(
  pricing: ToolPricing | undefined,
  today: string,
): PricingFreshness {
  if (!pricing) return "none";
  if (pricing.verification !== "verified") return "unverified";
  return daysBetween(pricing.checkedAt, today) > PRICING_STALE_AFTER_DAYS ? "stale" : "current";
}

/**
 * Plans safe to filter and compare on: verified and recently checked. Stale or
 * unverified pricing never matches a price filter, because we cannot say it is
 * still true.
 */
export function currentPlans(tool: Tool, today: string): PricingPlan[] {
  return pricingFreshness(tool.pricing, today) === "current" ? (tool.pricing?.plans ?? []) : [];
}

export function hasFreePlan(tool: Tool, today: string) {
  return currentPlans(tool, today).some((p) => p.price === 0);
}

export function hasPayAsYouGo(tool: Tool, today: string) {
  return currentPlans(tool, today).some((p) => p.interval === "usage");
}

/**
 * Price per month in USD, or undefined when it cannot be compared fairly:
 * other currencies (no exchange rates), one-time or usage-based prices, and
 * plans with no stated price. Yearly prices are divided by 12.
 */
export function monthlyUsd(plan: PricingPlan): number | undefined {
  if (plan.price === 0) return 0;
  if (plan.price === undefined || plan.currency !== "USD") return undefined;
  if (plan.interval === "month") return plan.price;
  if (plan.interval === "year") return plan.price / 12;
  return undefined;
}

/** The lowest comparable monthly price across current plans (0 when there is a free plan). */
export function cheapestMonthlyUsd(tool: Tool, today: string): number | undefined {
  const prices = currentPlans(tool, today)
    .map(monthlyUsd)
    .filter((n): n is number => n !== undefined);
  return prices.length ? Math.min(...prices) : undefined;
}

export function fitsBudget(tool: Tool, today: string, maxPerMonth: number) {
  const cheapest = cheapestMonthlyUsd(tool, today);
  return cheapest !== undefined && cheapest <= maxPerMonth;
}

/** "Free", "$12 per month", "Contact sales", or "Price not stated". */
export function formatPlanPrice(plan: PricingPlan): string {
  if (plan.price === 0) return "Free";
  if (plan.price === undefined) return plan.contactSales ? "Contact sales" : "Price not stated";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency ?? "USD",
    maximumFractionDigits: Number.isInteger(plan.price) ? 0 : 2,
  }).format(plan.price);
  return plan.interval ? `${amount} ${billingIntervalLabel[plan.interval]}` : amount;
}
