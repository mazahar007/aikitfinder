import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheckIcon,
  CalendarClockIcon,
  CircleHelpIcon,
  ClockIcon,
  HourglassIcon,
  TicketIcon,
} from "lucide-react";

import { SampleBadge, VerificationBadge } from "@/components/content/badges";
import { ToolLogo } from "@/components/content/tool-logo";
import { Badge } from "@/components/ui/badge";
import type { DealView } from "@/lib/content/deal-status";
import { dealStatusLabel, dealTypeLabel, eligibilityLabel, formatDate } from "@/lib/content/labels";
import type { DealStatus } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const statusStyle = {
  active: { variant: "success", icon: BadgeCheckIcon },
  upcoming: { variant: "info", icon: CalendarClockIcon },
  "needs-verification": { variant: "warning", icon: CircleHelpIcon },
  expired: { variant: "neutral", icon: HourglassIcon },
} as const;

/** Status always has an icon and a word; colour is never the only signal. */
export function DealStatusBadge({ state }: { state: DealStatus }) {
  const { variant, icon: Icon } = statusStyle[state];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {dealStatusLabel[state]}
    </Badge>
  );
}

/** One line about timing, using only dates an official source gave. */
export function dealTiming(deal: DealView): string {
  if (deal.state === "expired" && deal.endsOn) return `Ended ${formatDate(deal.endsOn)}`;
  if (deal.state === "upcoming" && deal.startsOn) {
    return `Starts ${formatDate(deal.startsOn)}${deal.endsOn ? ` · ends ${formatDate(deal.endsOn)}` : ""}`;
  }
  if (deal.endsOn) return `Ends ${formatDate(deal.endsOn)}`;
  return "No end date stated";
}

function Line({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}

export function DealCard({ deal }: { deal: DealView }) {
  const dimmed = deal.state === "expired";
  return (
    <article
      className={cn(
        "group card-motion relative flex h-full flex-col rounded-md border bg-card p-5 focus-within:border-primary hover:border-input hover:shadow-card-hover",
        dimmed && "bg-surface-subtle",
      )}
    >
      <div className="flex items-start gap-3">
        <ToolLogo name={deal.provider} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{deal.provider}</p>
          <h3 className="text-base leading-snug font-semibold text-foreground">
            <Link
              href={`/deals/${deal.slug}`}
              className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {deal.title}
            </Link>
          </h3>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <DealStatusBadge state={deal.state} />
        <Badge variant="neutral">
          <TicketIcon aria-hidden="true" />
          {dealTypeLabel[deal.type]}
        </Badge>
        {deal.affiliate ? <Badge variant="neutral">Affiliate link</Badge> : null}
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{deal.summary}</p>
      <div className="mt-3 space-y-1.5">
        <Line icon={<TicketIcon />}>{deal.amount ?? "Amount not stated"}</Line>
        <Line icon={<ClockIcon />}>{dealTiming(deal)}</Line>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        For: {deal.eligibility.map((e) => eligibilityLabel[e]).join(", ")}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <VerificationBadge status={deal.verification} date={deal.lastVerifiedAt} />
        {deal.isSample ? <SampleBadge /> : null}
      </div>
    </article>
  );
}
