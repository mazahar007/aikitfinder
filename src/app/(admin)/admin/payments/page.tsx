import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Payments & Billing" };

export default function Page() {
  return (
    <SectionPage
      title="Payments & Billing"
      description="Plans, subscriptions, credits and payment records."
      permission="billing.read"
      integrationKeys={["payments", "payment_provider"]}
      notBuilt="Plans, subscriptions, credit balances, the usage ledger, payment records and refunds. No payment provider is connected, no payment can be taken, and AutoFlow pricing has not been announced."
    />
  );
}
