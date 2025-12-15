export type Locale = "en" | "pt" | "es";

export type MarketingCopy = {
  en: string;
  pt: string;
  es: string;
};

export interface Quote {
  id: string;
  imageUrl: string;
  category: string;
  productName?: string;
  detectedMsrpUsd?: number;
  quoteUsd: number | null;
  normalQuoteUsd?: number | null;
  marketingCopy: MarketingCopy;
  status: "FAST_TRACK" | "VIP_REVIEW";
}
