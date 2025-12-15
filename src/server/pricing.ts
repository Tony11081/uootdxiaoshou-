import "server-only";

export const PRICING_RULES = {
  multiplier: 0.25,
  floorUsd: 135,
  ceilingUsd: 379,
} as const;

export const NORMAL_TIER_RULES = {
  multiplier: 0.65,
  floorUsd: 90,
} as const;

export type QuoteStatus = "FAST_TRACK" | "VIP_REVIEW";

export function computeQuoteFromMsrp(msrpUsd: number): {
  quoteUsd: number;
  status: QuoteStatus;
  capped: boolean;
} {
  const safeMsrp = Number.isFinite(msrpUsd) ? msrpUsd : 0;
  const rawQuote = safeMsrp * PRICING_RULES.multiplier;
  const bounded = Math.min(PRICING_RULES.ceilingUsd, Math.max(PRICING_RULES.floorUsd, rawQuote));
  const quoteUsd = Math.round(bounded);

  return {
    quoteUsd,
    status: "FAST_TRACK",
    capped: quoteUsd !== Math.round(rawQuote),
  };
}

export function computeNormalQuoteFromPremium(premiumUsd: number): number {
  const safePremium = Number.isFinite(premiumUsd) ? premiumUsd : 0;
  const raw = safePremium * NORMAL_TIER_RULES.multiplier;
  const bounded = Math.max(NORMAL_TIER_RULES.floorUsd, raw);
  return Math.round(bounded);
}
