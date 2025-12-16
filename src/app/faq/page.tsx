import Link from "next/link";

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="glass-card rounded-3xl p-6">
      <summary className="cursor-pointer list-none select-none text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
        {q}
      </summary>
      <p className="mt-4 text-sm text-[#4f4635]">{a}</p>
    </details>
  );
}

export default function FAQPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">FAQ</h1>
        <p className="text-sm text-[#5c5345]">
          Short answers, no noise.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <FAQItem
          q="Why WhatsApp?"
          a="It’s the fastest way to confirm size, color, and availability before invoicing."
        />
        <FAQItem
          q="Why PayPal email?"
          a="We use it only to send your invoice (we don’t store payment details)."
        />
        <FAQItem
          q="What if an instant quote isn’t available?"
          a="We route it to VIP review and reply on WhatsApp."
        />
        <FAQItem
          q="Is my screenshot private?"
          a="Yes—screenshots are used only to prepare your quote and are never posted."
        />
        <FAQItem
          q="Do I need an account?"
          a="No—no login required and no marketing spam."
        />
        <FAQItem
          q="Do you ship worldwide?"
          a="Yes—worldwide free shipping. US & Europe: 7–12 business days. Other countries: ~7–20 business days."
        />
        <FAQItem
          q="When do I receive QC photos?"
          a="Within 24h. We ship only after your approval."
        />
        <FAQItem
          q="What can you source?"
          a="Luxury shoes, bags, clothing, swimwear, sunglasses, and accessories across many brands."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Upload a screenshot
        </Link>
        <Link
          href="/contact"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
