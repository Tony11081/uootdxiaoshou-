import "server-only";

export const PRICING_RULES = {
  multiplier: 0.25,
  autoMinUsd: 90,
  autoMaxUsd: 250,
} as const;

export type QuoteStatus = "FAST_TRACK" | "VIP_REVIEW";

export function computeQuoteFromMsrp(msrpUsd: number): {
  quoteUsd: number;
  status: QuoteStatus;
  withinAutoBand: boolean;
} {
  const safeMsrp = Number.isFinite(msrpUsd) ? msrpUsd : 0;
  const quoteUsd = Math.round(safeMsrp * PRICING_RULES.multiplier);
  const withinAutoBand =
    quoteUsd >= PRICING_RULES.autoMinUsd && quoteUsd <= PRICING_RULES.autoMaxUsd;

  return {
    quoteUsd,
    status: withinAutoBand ? "FAST_TRACK" : "VIP_REVIEW",
    withinAutoBand,
  };
}

