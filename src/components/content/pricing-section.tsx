import { AlertTriangleIcon, CircleHelpIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";

import { VerificationBadge } from "@/components/content/badges";
import { formatDate } from "@/lib/content/labels";
import { formatPlanPrice, pricingFreshness } from "@/lib/content/pricing";
import type { Tool } from "@/lib/content/types";

function OfficialLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex min-h-11 items-center gap-1 font-medium text-primary hover:underline"
    >
      {children}
      <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/**
 * Plan-by-plan pricing. Figures are shown only while they are verified; if
 * they were not re-checked recently they carry a clear "may be out of date"
 * warning, and unverified pricing is not shown at all.
 */
export function PricingSection({ tool, today }: { tool: Tool; today: string }) {
  const { pricing } = tool;
  const freshness = pricingFreshness(pricing, today);

  if (!pricing || freshness === "unverified") {
    return (
      <div className="rounded-md border border-dashed bg-card p-5">
        <p className="flex items-start gap-2 text-muted-foreground">
          <CircleHelpIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            We haven’t verified {tool.name}’s plans and prices yet, so we don’t show any. Check the
            official site for current pricing.
          </span>
        </p>
        <div className="mt-2">
          <OfficialLink href={pricing?.pricingUrl ?? tool.officialUrl}>
            {pricing ? "Official pricing page" : "Official website"}
          </OfficialLink>
        </div>
      </div>
    );
  }

  const stale = freshness === "stale";
  return (
    <div>
      {stale ? (
        <p
          role="note"
          className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-warning">These prices may be out of date.</strong>{" "}
            We last checked on {formatDate(pricing.checkedAt)}. Confirm on the official pricing page
            before you pay.
          </span>
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pricing.plans.map((plan) => (
          <li
            key={plan.name}
            className={`rounded-md border bg-card p-4 ${stale ? "border-dashed" : ""}`}
          >
            <h3 className="font-semibold text-heading">{plan.name}</h3>
            <p className="mt-1 text-xl font-bold text-heading">{formatPlanPrice(plan)}</p>
            {plan.priceNote ? (
              <p className="mt-1 text-sm text-muted-foreground">{plan.priceNote}</p>
            ) : null}
            <p className="mt-3 text-sm">
              <span className="font-medium text-foreground">Limits: </span>
              {plan.usageLimits ?? <span className="text-muted-foreground">Not stated</span>}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {/* A "Verified" badge next to an out-of-date warning would contradict it. */}
        <VerificationBadge
          status={stale ? "needs-review" : pricing.verification}
          date={pricing.checkedAt}
        />
        <OfficialLink href={pricing.pricingUrl}>Official pricing page</OfficialLink>
        {pricing.apiPricingUrl ? (
          <OfficialLink href={pricing.apiPricingUrl}>API pricing</OfficialLink>
        ) : null}
      </div>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Prices can change at any time and may differ by region or tax. The official page is always
          the final word.
        </span>
      </p>
    </div>
  );
}
