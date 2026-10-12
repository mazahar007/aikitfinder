import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AlertTriangleIcon, ExternalLinkIcon, FlaskConicalIcon } from "lucide-react";

import { SampleBadge } from "@/components/content/badges";
import { CopyButton } from "@/components/content/copy-button";
import { DealStatusBadge } from "@/components/content/deal-card";
import { SourcesList } from "@/components/content/sources-list";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { dealTypeLabel, eligibilityLabel, formatDate } from "@/lib/content/labels";
import { getDeal, getDeals, getTool } from "@/lib/content/repository";

export async function generateStaticParams() {
  const deals = await getDeals();
  return deals.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/deals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDeal(slug);
  if (!deal) return {};
  return {
    title: `${deal.provider}: ${deal.title}`,
    description: deal.summary,
    alternates: { canonical: `/deals/${deal.slug}` },
    // Expired and unconfirmed offers are thin, short-lived pages.
    robots:
      deal.state === "expired" || deal.state === "needs-verification"
        ? { index: false }
        : undefined,
  };
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t pt-8">
      <h2
        id={`${id}-heading`}
        className="text-xl font-bold tracking-tight text-heading sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function DealPage({ params }: PageProps<"/deals/[slug]">) {
  const { slug } = await params;
  const deal = await getDeal(slug);
  if (!deal) notFound();
  const tool = deal.toolSlug ? await getTool(deal.toolSlug) : undefined;

  const warning =
    deal.state === "expired"
      ? `This offer ended${deal.endsOn ? ` on ${formatDate(deal.endsOn)}` : ""}. It is kept here for reference and may no longer be available.`
      : deal.state === "needs-verification"
        ? "We have not confirmed this offer recently, or at all. Check the provider’s official page before you rely on it."
        : deal.state === "upcoming"
          ? `This offer has not started yet${deal.startsOn ? `. It starts on ${formatDate(deal.startsOn)}` : ""}.`
          : null;

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Deals", href: "/deals" },
          { label: deal.title },
        ]}
      />
      <header className="mt-4 flex items-start gap-4">
        <ToolLogo name={deal.provider} size="lg" />
        <div className="min-w-0">
          <p className="text-muted-foreground">{deal.provider}</p>
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-h1">
            {deal.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DealStatusBadge state={deal.state} />
            <span className="text-sm text-muted-foreground">{dealTypeLabel[deal.type]}</span>
            {deal.affiliate ? (
              <span className="text-sm text-muted-foreground">· Affiliate link</span>
            ) : null}
            {deal.isSample ? <SampleBadge /> : null}
          </div>
        </div>
      </header>

      {deal.isSample ? (
        <p className="mt-6 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm">
          <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-warning">Sample offer:</strong> this offer is
            fictional. Its amounts, dates and eligibility were invented to test this page.
          </span>
        </p>
      ) : null}
      {warning ? (
        <p
          role="note"
          className="mt-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>{warning}</span>
        </p>
      ) : null}

      <p className="mt-6 max-w-3xl text-lead">{deal.summary}</p>

      <section
        aria-labelledby="facts-heading"
        className="mt-6 rounded-lg border bg-card p-5 sm:p-6"
      >
        <h2 id="facts-heading" className="text-sm font-semibold text-heading">
          Offer details
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
          <Fact label="Amount">{deal.amount ?? "Not stated by the provider"}</Fact>
          <Fact label="Who it’s for">
            {deal.eligibility.map((e) => eligibilityLabel[e]).join(", ")}
          </Fact>
          <Fact label="Regions">{deal.regions ?? "No restriction stated"}</Fact>
          <Fact label="Starts">{deal.startsOn ? formatDate(deal.startsOn) : "Not stated"}</Fact>
          <Fact label="Ends">{deal.endsOn ? formatDate(deal.endsOn) : "No end date stated"}</Fact>
          <Fact label="Last checked">
            {deal.lastVerifiedAt ? formatDate(deal.lastVerifiedAt) : "Not checked yet"}
          </Fact>
        </dl>
        {deal.couponCode ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
            <span className="text-sm text-muted-foreground">Coupon code</span>
            <code className="rounded-md border bg-surface-subtle px-2 py-1 font-mono text-sm">
              {deal.couponCode}
            </code>
            <CopyButton text={deal.couponCode} label="Copy code" />
          </div>
        ) : null}
      </section>

      <div className="mt-10 max-w-3xl space-y-10">
        <Section id="eligibility" title="Who can claim it">
          <p>{deal.eligibilityNotes}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Being listed does not mean you qualify. The provider decides.
          </p>
        </Section>

        <Section id="claim" title="How to claim it">
          <ol className="space-y-3">
            {deal.claimSteps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-learn text-xs font-bold text-learn-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a
                href={deal.claimUrl}
                target="_blank"
                rel={`noopener noreferrer nofollow${deal.affiliate ? " sponsored" : ""}`}
              >
                Go to the official offer page
                <ExternalLinkIcon aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={deal.termsUrl} target="_blank" rel="noopener noreferrer nofollow">
                Read the terms
                <ExternalLinkIcon aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </div>
          {deal.affiliate ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Disclosure: we may earn a commission if you claim this offer through our link. It does
              not change the price you pay.
            </p>
          ) : null}
        </Section>

        {tool ? (
          <Section id="tool" title="About the tool">
            <p>
              <Link
                href={`/tools/${tool.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {tool.name}
              </Link>
              : {tool.shortDescription}
            </p>
          </Section>
        ) : null}

        <Section id="sources" title="Sources and verification">
          <SourcesList
            sources={deal.sources}
            verification={deal.verification}
            lastVerifiedAt={deal.lastVerifiedAt}
            updatedAt={deal.updatedAt}
          />
        </Section>
      </div>
    </Container>
  );
}
