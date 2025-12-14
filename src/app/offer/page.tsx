"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactInfo } from "@/components/contact-info";
import { OfferCard } from "@/components/offer-card";
import type { Locale, Quote } from "@/types/quote";

const sampleOffer: Quote = {
  id: "sample-offer",
  imageUrl:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  category: "BAG",
  productName: "Brushed Hardware Tote",
  detectedMsrpUsd: 980,
  quoteUsd: 245,
  marketingCopy: {
    en: "Vault-finish calfskin tote with brushed hardware and double stitch handles. Ships discreetly with protective dust bag.",
    pt: "Bolsa tote em couro com ferragens escovadas e alcas reforcadas. Envio discreto com dust bag.",
    es: "Bolso tote en piel con herrajes cepillados y asas reforzadas. Envio discreto con dust bag.",
  },
  status: "FAST_TRACK",
};

export default function OfferPage() {
  const [locale, setLocale] = useState<Locale>("en");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
            UOOTD | Offer Link
          </p>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">
            Shareable Offer Preview
          </h1>
          <p className="text-sm text-[#5c5345]">
            This mirrors what a buyer sees after upload: private quote,
            trilingual copy, and VIP routing when needed.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-2 py-1 text-sm shadow-md backdrop-blur">
          {(["en", "pt", "es"] as Locale[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setLocale(opt)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                locale === opt
                  ? "bg-black text-[#fef7d2]"
                  : "text-[#5b5143] hover:text-black"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <OfferCard
        quote={sampleOffer}
        locale={locale}
        title="Shareable Offer"
        footnote="If a quote needs extra review, we route it to VIP chat; otherwise it fast-tracks."
      />

      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4">
        <div className="text-sm text-[#4f4635]">
          WhatsApp handoff is prefilled with product and quote details after
          capturing PayPal + WhatsApp.
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Back to Upload
          </Link>
        </div>
      </div>

      <ContactInfo locale={locale} />
    </div>
  );
}
