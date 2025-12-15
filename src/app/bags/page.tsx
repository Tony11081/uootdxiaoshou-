import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/components/contact-info";

const SITE_URL = "https://newuootd.com";

export const metadata: Metadata = {
  title: "UOOTD Bags – Upload Screenshot & Get Price",
  description:
    "Upload a bag screenshot to request a private quote. Worldwide free shipping. PayPal invoice only. Discreet packaging.",
  alternates: {
    canonical: `${SITE_URL}/bags`,
  },
};

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

export default function BagsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          UOOTD Bags – Instant Quote from Your Screenshot
        </h1>
        <p className="text-sm text-[#5c5345]">
          Upload a screenshot of the bag you want. We&apos;ll reply with a private quote and next steps.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          How It Works
        </h2>
        <ol className="mt-4 grid gap-3 text-sm text-[#4f4635] sm:grid-cols-3">
          <li className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
              01
            </p>
            <p className="font-semibold text-[var(--ink)]">Screenshot</p>
            <p className="text-xs">Capture the full item + any visible logo/hardware.</p>
          </li>
          <li className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
              02
            </p>
            <p className="font-semibold text-[var(--ink)]">Upload</p>
            <p className="text-xs">Get an instant quote when available.</p>
          </li>
          <li className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
              03
            </p>
            <p className="font-semibold text-[var(--ink)]">Confirm</p>
            <p className="text-xs">PayPal invoice only. Worldwide free shipping.</p>
          </li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/#upload"
            className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Upload a screenshot
          </Link>
          <a
            href={`https://wa.me/${CONTACT.whatsappDigits}`}
            target="_blank"
            rel="noreferrer"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            WhatsApp us
          </a>
        </div>

        <p className="mt-4 text-xs text-[#5c5345]">
          Popular requests include totes, shoulder bags, crossbody bags, mini bags, travel bags, and accessories.
          If you searched <strong>uootd bags</strong> or <strong>uootd bag</strong>, start here and upload your screenshot.
        </p>
      </section>

      <section className="grid gap-3">
        <FAQItem
          q="Do you ship worldwide?"
          a="Yes. Worldwide free shipping. US & Europe: 7–12 business days. Other countries: ~7–20 business days."
        />
        <FAQItem
          q="How do you handle payments?"
          a="PayPal invoice only. No prepayment and no card forms on our site. You receive a PayPal invoice after confirming details."
        />
        <FAQItem
          q="Is my screenshot private?"
          a="Yes. Your screenshot is used only to prepare your quote and is automatically deleted after 7 days."
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          Next Pages
        </h2>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[#4f4635]">
          <Link href="/" className="underline decoration-dotted hover:text-[var(--ink)]">
            Home
          </Link>
          <Link href="/golden-goose" className="underline decoration-dotted hover:text-[var(--ink)]">
            Golden Goose
          </Link>
          <Link href="/faq" className="underline decoration-dotted hover:text-[var(--ink)]">
            FAQ
          </Link>
          <Link href="/contact" className="underline decoration-dotted hover:text-[var(--ink)]">
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}

