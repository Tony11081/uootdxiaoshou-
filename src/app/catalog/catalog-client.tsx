"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTACT } from "@/components/contact-info";

const CATALOG_URL = "https://www.wsxcme.com/weshop/store/A202005261219019980372630";

function buildWhatsAppLink() {
  const text =
    "Hi UOOTD, I'm browsing your product catalog and I'd like to ask about an item. " +
    "Catalog link: " +
    CATALOG_URL +
    " (Please share QC photos/video and availability. I'll send a screenshot or product name.)";
  return `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(text)}`;
}

export function CatalogClient() {
  const [loaded, setLoaded] = useState(false);
  const whatsAppHref = useMemo(() => buildWhatsAppLink(), []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-10 pt-8 sm:px-8 lg:px-12">
      <header className="glass-card rounded-3xl border border-black/8 bg-white/90 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
              UOOTD
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
              Product Catalog
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#4f4635]">
              Browse our directory without leaving the site. If it doesn&apos;t load
              on your phone (some browsers block embedded cookies), tap{" "}
              <a
                href={CATALOG_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#7b6848] underline decoration-dotted hover:text-black"
              >
                Open full catalog
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/#upload"
              className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Upload screenshot for quote
            </Link>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Chat on WhatsApp
            </a>
            <a
              href={CATALOG_URL}
              target="_blank"
              rel="noreferrer"
              className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Open full catalog
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5c5345]">
          {[
            "Tip: Tap any item → screenshot → upload for instant quote",
            "Need QC? We can send photos/video in WhatsApp",
            "QC photos within 24h · ship only after approval",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/8 bg-white/80 px-3 py-2 shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </header>

      <section className="glass-card relative overflow-hidden rounded-3xl border border-black/8 bg-white/90">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 p-6 text-center backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6848]">
                Loading catalog
              </p>
              <p className="mt-2 text-sm text-[#4f4635]">
                If it stays blank, use{" "}
                <a
                  href={CATALOG_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#7b6848] underline decoration-dotted hover:text-black"
                >
                  Open full catalog
                </a>
                .
              </p>
              <div className="mt-4 scanner-rail h-2 rounded-full bg-black/5" />
            </div>
          </div>
        ) : null}

        <iframe
          title="UOOTD catalog"
          src={CATALOG_URL}
          className="h-[calc(100vh-180px)] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
        />
      </section>
    </div>
  );
}

