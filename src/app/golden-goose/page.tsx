import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/components/contact-info";

const SITE_URL = "https://newuootd.com";

export const metadata: Metadata = {
  title: "UOOTD Golden Goose – Get a Quote from Photo",
  description:
    "Upload a Golden Goose (GGDB) screenshot to request a private quote. Optional size selection. Worldwide shipping. PayPal invoice only.",
  alternates: {
    canonical: `${SITE_URL}/golden-goose`,
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

export default function GoldenGoosePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          UOOTD Golden Goose – Upload a Photo, Get a Quote
        </h1>
        <p className="text-sm text-[#5c5345]">
          If you searched <strong>uootd golden goose</strong>, you can upload your screenshot here and request a private quote.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          Quick Start
        </h2>
        <p className="mt-3 text-sm text-[#4f4635]">
          Upload a clear screenshot showing the full pair and any key details (colorway, model name, outsole, heel tab, or logo).
          Size selection is optional — we can confirm sizing on WhatsApp.
        </p>

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
            Ask on WhatsApp
          </a>
        </div>
      </section>

      <section className="grid gap-3">
        <FAQItem
          q="How fast is delivery?"
          a="Worldwide free shipping. US & Europe: 7–12 business days. Other countries: ~7–20 business days."
        />
        <FAQItem
          q="How do invoices work?"
          a="We only use PayPal invoices. After you confirm details, we send a PayPal invoice to your email."
        />
        <FAQItem
          q="Will my screenshot be stored?"
          a="Screenshots are used only to prepare your quote and are automatically deleted after 7 days."
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          Explore
        </h2>
        <p className="mt-3 text-sm text-[#4f4635]">
          We also source bags, clothing, swimwear, sunglasses, and accessories. For general requests, go to the upload page and submit your screenshot.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[#4f4635]">
          <Link href="/" className="underline decoration-dotted hover:text-[var(--ink)]">
            Home
          </Link>
          <Link href="/bags" className="underline decoration-dotted hover:text-[var(--ink)]">
            Bags
          </Link>
          <Link href="/offer" className="underline decoration-dotted hover:text-[var(--ink)]">
            Offer
          </Link>
          <Link href="/contact" className="underline decoration-dotted hover:text-[var(--ink)]">
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}

