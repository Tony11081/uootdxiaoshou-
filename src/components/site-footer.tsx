import Link from "next/link";
import { CONTACT } from "@/components/contact-info";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-14 border-t border-black/10 bg-white/30 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
            UOOTD
          </p>
          <p className="mt-3 text-lg font-semibold text-[var(--ink)]">
            Private quoting &amp; confirmation desk.
          </p>
          <p className="mt-2 text-sm text-[#4f4635]">
            Discreet by default. No login. No spam.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${CONTACT.whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Email
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6848]">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#4f4635]">
            <li>
              <Link href="/" className="hover:text-[var(--ink)]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/bags" className="hover:text-[var(--ink)]">
                Bags
              </Link>
            </li>
            <li>
              <Link href="/golden-goose" className="hover:text-[var(--ink)]">
                Golden Goose
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--ink)]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--ink)]">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[var(--ink)]">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6848]">
            Information
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#4f4635]">
            <li>
              <Link href="/privacy" className="hover:text-[var(--ink)]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[var(--ink)]">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/mission" className="hover:text-[var(--ink)]">
                Our Mission
              </Link>
            </li>
            <li>
              <Link href="/sitemap" className="hover:text-[var(--ink)]">
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-[var(--ink)]">
                Sitemap (XML)
              </Link>
            </li>
          </ul>

          <p className="mt-6 text-xs text-[#5c5345]">
            PayPal invoice only · Discreet packaging · Worldwide free shipping
          </p>
        </div>
      </div>

      <div className="border-t border-black/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-[#5c5345] sm:px-8 lg:px-12">
          <p>&copy; {year} UOOTD. All rights reserved.</p>
          <p className="font-mono">{CONTACT.whatsappDisplay}</p>
        </div>
      </div>
    </footer>
  );
}
