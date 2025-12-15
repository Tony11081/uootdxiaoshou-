import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { computeNormalQuoteFromPremium, computeQuoteFromMsrp } from "@/server/pricing";
import { putQuoteAsset } from "@/server/assets-store";

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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

function parseDataUrl(imageUrl: string) {
  if (!imageUrl.startsWith("data:")) return null;
  const match = imageUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) return null;
  const [, mimeType, data] = match;
  return { mimeType, data };
}

async function callOpenRouter(imageUrl: string, prompt: string, descriptionHint?: string) {
  if (!OPENROUTER_API_KEY) return null;

  const dataUrl = parseDataUrl(imageUrl);
  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: "text", text: prompt },
  ];
  if (dataUrl) {
    parts.push({ type: "image_url", image_url: { url: `data:${dataUrl.mimeType};base64,${dataUrl.data}` } });
  } else {
    parts.push({ type: "text", text: `Image URL: ${imageUrl}` });
  }
  if (descriptionHint) {
    parts.push({ type: "text", text: `User hint: ${descriptionHint}` });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: parts }],
      response_format: { type: "json_object" },
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter request failed: ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.[0]?.text || data?.choices?.[0]?.message?.content;
  return text as string;
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

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

async function fetchDetection(
  imageUrl: string,
  requestedCategory: Category,
  descriptionHint?: string,
) {
  const prompt = `
You are a product identifier for luxury fashion items.
Return JSON ONLY with keys:
- product_name: concise product title (string)
- category: one of FOOTWEAR, BAG, ACCESSORY, UNKNOWN
- detected_msrp_usd: numeric MSRP in USD (number, can be null if unknown)
- description: one sentence marketing-style description (string)
`.trim();

  // Try OpenRouter first if configured
  if (OPENROUTER_API_KEY) {
    const rawText = await callOpenRouter(imageUrl, prompt, descriptionHint).catch(() => null);
    const parsed = safeJsonParse<{
      product_name?: string;
      category?: string;
      detected_msrp_usd?: number;
      description?: string;
    }>(rawText || "");
    if (parsed) return parsed;
  }

  if (MODEL) {
    const dataUrl = parseDataUrl(imageUrl);
    const imagePart = dataUrl
      ? {
          inlineData: {
            data: dataUrl.data,
            mimeType: dataUrl.mimeType,
          },
        }
      : null;

    const parts = [
      { text: prompt },
    ] as Array<{ text: string } | { inlineData: { data: string; mimeType: string } }>;
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

  return null;
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
    detectedMsrpUsd: (() => {
      const mg: Record<string, unknown> =
        geminiDetection && typeof geminiDetection === "object" ? geminiDetection : {};
      const candidate =
        toNumber(geminiDetection?.detected_msrp_usd) ||
        toNumber(mg.msrp) ||
        toNumber(mg.msrp_usd) ||
        toNumber(mg.price_usd) ||
        toNumber(mg.price);
      if (candidate !== null) return candidate;
      return requestedCategory === "FOOTWEAR"
        ? 780
        : requestedCategory === "BAG"
          ? 980
          : 2400;
    })(),
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
  const normalQuoteUsd = computeNormalQuoteFromPremium(computed.quoteUsd);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q-${Date.now()}`;

  await putQuoteAsset(id, raw).catch(() => {});

  return NextResponse.json({
    id,
    category: detection.category,
    product_name: detection.productName,
    detected_msrp_usd: detection.detectedMsrpUsd,
    quote_usd: computed.quoteUsd,
    normal_quote_usd: normalQuoteUsd,
    status: computed.status,
    capped: computed.capped,
    marketing_copy: {
      en: detection.description,
      pt: detection.description,
      es: detection.description,
    },
  });
}
