import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://newuootd.com";

export const metadata: Metadata = {
  title: "UOTD or UOOTD? You’re Probably Looking for Us",
  description:
    "If you searched UOTD, UUOTD, or UOOTD oficial, you’re likely looking for the UOOTD official site. Upload a screenshot to get a private quote.",
  alternates: {
    canonical: `${SITE_URL}/uotd`,
  },
};

export default function UotdPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          UOTD or UOOTD?
        </h1>
        <p className="text-sm text-[#5c5345]">
          If you searched <strong>uotd</strong>, <strong>uuotd</strong>, or <strong>uootd oficial</strong>, you&apos;re in the right place.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          The UOOTD Official Site
        </h2>
        <p className="mt-4 text-sm text-[#4f4635]">
          This is the UOOTD insider quoting platform. Upload a screenshot to request a private quote for luxury shoes, bags, clothing, swimwear, sunglasses, and accessories.
          Payments are handled via PayPal invoice only, with worldwide free shipping.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/#upload"
            className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Upload a screenshot
          </Link>
          <Link
            href="/bags"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Explore bags
          </Link>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          Helpful Links
        </h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[#4f4635]">
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

