import Image from "next/image";
import type { Locale, Quote } from "@/types/quote";

type OfferCardProps = {
  quote: Quote;
  locale: Locale;
  title?: string;
  footnote?: string;
};

const localeLabels: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  es: "ES",
};

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function OfferCard({
  quote,
  locale,
  title = "Private Offer",
  footnote,
}: OfferCardProps) {
  const copy = quote.marketingCopy?.[locale] || quote.marketingCopy?.en;
  const isFootwear = quote.category?.toUpperCase() === "FOOTWEAR";
  const isFastTrack = quote.status === "FAST_TRACK" && quote.quoteUsd !== null;
  const priceLabel = quote.quoteUsd === null ? "VIP Price" : `$${formatUsd(quote.quoteUsd)}`;

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#0f0f0f] lg:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-transparent to-black/50" />
          <Image
            src={quote.imageUrl}
            alt="Uploaded item"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          <div className="vignette absolute inset-0" />
          <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#f3e5b8]">
            {quote.category || "Unknown"}
          </div>
          <div className="absolute right-3 top-3 rounded-lg border border-[#d4af37]/40 bg-gradient-to-br from-[#f9f1d0]/80 to-[#cfa02f]/80 px-3 py-1 text-xs font-semibold text-[#111] shadow-md">
            {isFastTrack ? "PRIVATE" : "VIP"}
          </div>
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4 text-[#f5f4f1]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">
              Quoted Price
            </p>
            <p className="text-3xl font-semibold text-[#fef7d2]">
              {priceLabel}
            </p>
            <p className="text-sm text-[#f2e9cf]">
              {isFastTrack ? "Fast Track" : "Contact for VIP Price"}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-1/2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b6a3d]">
              {title}
            </p>
            <span className="rounded-full bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f7eec8]">
              {localeLabels[locale]}
            </span>
          </div>

          <h3 className="text-3xl font-semibold leading-tight text-[var(--ink)]">
            {quote.quoteUsd === null
              ? "Contact for VIP Price"
              : `Quoted Price: $${formatUsd(quote.quoteUsd)}`}
          </h3>
          {quote.productName ? (
            <p className="text-base font-semibold text-[var(--ink)]">
              {quote.productName}
            </p>
          ) : null}
          <p className="text-sm uppercase tracking-[0.16em] text-[#7a6845]">
            {quote.category}
          </p>

          <p className="rounded-2xl bg-[#111111]/5 px-4 py-3 text-base leading-relaxed text-[var(--ink)]">
            {copy}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-black/10 bg-white/80 px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7a6a42]">
                Status
              </p>
              <p className="font-semibold text-[var(--ink)]">
                {isFastTrack ? "Fast Track" : "VIP Review"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#d4af37]/30 bg-[#f9f4e2]/60 px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7a6a42]">
                Category
              </p>
              <p className="font-semibold text-[var(--ink)]">
                {isFootwear ? "Footwear (size required)" : quote.category}
              </p>
            </div>
          </div>

          {footnote ? (
            <p className="text-xs text-[#5c5345]">{footnote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
