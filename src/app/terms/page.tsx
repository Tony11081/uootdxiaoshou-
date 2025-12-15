import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12 sm:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Terms</h1>
        <p className="text-sm text-[#5c5345]">
          Quotes are private and subject to confirmation.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <ul className="list-disc space-y-2 pl-5 text-sm text-[#4f4635]">
          <li>Quotes can change based on size, color, and availability.</li>
          <li>
            Worldwide free shipping. US &amp; Europe: 7–12 business days. Other countries: ~7–20 business days (estimates).
          </li>
          <li>Taxes/duties (if any) are confirmed on WhatsApp before invoicing.</li>
          <li>Invoices are sent to the PayPal email you provide.</li>
          <li>No account is required; we do not send marketing spam.</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Back
        </Link>
        <Link
          href="/privacy"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
}
