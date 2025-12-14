import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { computeQuoteFromMsrp } from "@/server/pricing";

type Category = "FOOTWEAR" | "BAG" | "ACCESSORY" | "UNKNOWN";

export const dynamic = "force-dynamic";

type QuoteRequestPayload = {
  imageUrl?: string;
  demoType?: string;
  description?: string;
};

const MODEL = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
      model: "gemini-1.5-flash",
    })
  : null;

function parseDataUrl(imageUrl: string) {
  if (!imageUrl.startsWith("data:")) return null;
  const match = imageUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) return null;
  const [, mimeType, data] = match;
  return { mimeType, data };
}

function normalizeCategory(value: string | undefined): Category {
  const upper = (value || "").toUpperCase();
  if (upper === "FOOTWEAR") return "FOOTWEAR";
  if (upper === "BAG") return "BAG";
  if (upper === "ACCESSORY") return "ACCESSORY";
  return "UNKNOWN";
}

function fallbackCategoryFromHint(hint: string): Category {
  if (hint.includes("shoe") || hint.includes("boot") || hint.includes("sneaker")) return "FOOTWEAR";
  if (hint.includes("bag") || hint.includes("tote")) return "BAG";
  if (hint.includes("watch")) return "ACCESSORY";
  return "BAG";
}

function safeJsonParse<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    const cleaned = raw.trim().replace(/^```json/i, "").replace(/```$/, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function fetchDetection(
  imageUrl: string,
  requestedCategory: Category,
  descriptionHint?: string,
) {
  if (!MODEL) return null;

  const dataUrl = parseDataUrl(imageUrl);
  const imagePart = dataUrl
    ? {
        inlineData: {
          data: dataUrl.data,
          mimeType: dataUrl.mimeType,
        },
      }
    : null;

  const prompt = `
You are a product identifier for luxury fashion items.
Return JSON ONLY with keys:
- product_name: concise product title (string)
- category: one of FOOTWEAR, BAG, ACCESSORY, UNKNOWN
- detected_msrp_usd: numeric MSRP in USD (number, can be null if unknown)
- description: one sentence marketing-style description (string)
`.trim();

  const parts = [{ text: prompt }] as Array<{ text: string } | { inlineData: { data: string; mimeType: string } }>;
  if (imagePart) {
    parts.push(imagePart);
  } else {
    parts.push({ text: `Image URL: ${imageUrl}` });
  }
  if (descriptionHint) {
    parts.push({ text: `User hint: ${descriptionHint}` });
  }

  const result = await MODEL.generateContent({
    contents: [{ role: "user", parts }],
  });

  const rawText = result.response?.text();
  return safeJsonParse<{
    product_name?: string;
    category?: string;
    detected_msrp_usd?: number;
    description?: string;
  }>(rawText);
}

export async function POST(request: Request) {
  const payload: QuoteRequestPayload = await request.json().catch(() => ({}));
  const raw = typeof payload.imageUrl === "string" ? payload.imageUrl : "";
  const hint = raw.toLowerCase();

  const requestedType = String(payload.demoType || "").toUpperCase();
  const requestedCategory: Category =
    requestedType === "FOOTWEAR" || requestedType === "BAG" || requestedType === "ACCESSORY"
      ? (requestedType as Category)
      : fallbackCategoryFromHint(hint);

  const geminiDetection = await fetchDetection(raw, requestedCategory, payload.description).catch(() => null);

  const detection = {
    productName: geminiDetection?.product_name || payload.description || "Detected item",
    detectedMsrpUsd:
      typeof geminiDetection?.detected_msrp_usd === "number"
        ? geminiDetection.detected_msrp_usd
        : requestedCategory === "FOOTWEAR"
          ? 780
          : requestedCategory === "BAG"
            ? 980
            : 2400,
    description:
      (typeof geminiDetection?.description === "string" && geminiDetection.description.trim()) ||
      (typeof payload.description === "string" && payload.description.trim()) ||
      "Private quote prepared from your screenshot.",
    category:
      normalizeCategory(geminiDetection?.category) === "UNKNOWN"
        ? requestedCategory
        : normalizeCategory(geminiDetection?.category) || requestedCategory,
  };

  const computed = computeQuoteFromMsrp(detection.detectedMsrpUsd);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q-${Date.now()}`;

  return NextResponse.json({
    id,
    category: detection.category,
    product_name: detection.productName,
    detected_msrp_usd: detection.detectedMsrpUsd,
    quote_usd: computed.quoteUsd,
    status: computed.status,
    capped: computed.capped,
    marketing_copy: {
      en: detection.description,
      pt: detection.description,
      es: detection.description,
    },
  });
}
