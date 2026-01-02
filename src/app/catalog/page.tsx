import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/components/contact-info";

const SITE_URL = "https://newuootd.com";
const VIP_MESSAGE =
  "Hi UOOTD, please send me the VIP access link. I'm interested in [category] and shipping to [country].";

export const metadata: Metadata = {
  title: "VIP Access | UOOTD",
  description: "Request the private VIP access link via WhatsApp.",
  alternates: {
    canonical: `${SITE_URL}/catalog`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CatalogPage() {
  const whatsappLink = `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(
    VIP_MESSAGE,
  )}`;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">VIP Access</h1>
        <p className="text-sm text-[#5c5345]">
          Access to the VIP link is shared in private chat only. Tap WhatsApp to
          request your link.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <div className="grid gap-3 text-sm text-[#4f4635]">
          <p>How it works:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Tap WhatsApp and send the pre-filled request.</li>
            <li>We confirm your request and share the VIP link.</li>
            <li>Open the link in your browser to browse privately.</li>
          </ol>
          <p>
            To protect client privacy and reduce automated scraping, we don&apos;t
            publish the link on the website.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Get VIP Link on WhatsApp
          </a>
          <Link
            href="/"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Upload for Quote
          </Link>
        </div>
      </section>
    </div>
  );
}

