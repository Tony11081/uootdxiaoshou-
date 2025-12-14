import { NextResponse } from "next/server";
import { computeQuoteFromMsrp } from "@/server/pricing";

const copy = {
  FOOTWEAR: {
    en: "Hand-finished calfskin boot with atelier-grade stitching. Ships discreetly with dust bag and double-boxed packaging.",
    pt: "Bota em couro com costura de atelier. Envio discreto com dust bag e embalagem dupla.",
    es: "Bota de piel con costuras de atelier. Envio discreto con dust bag y embalaje doble.",
  },
  BAG: {
    en: "Vault-finish calfskin tote with brushed hardware and double stitch handles. Ships discreetly with protective dust bag.",
    pt: "Bolsa tote em couro com ferragens escovadas e alcas reforcadas. Envio discreto com dust bag.",
    es: "Bolso tote en piel con herrajes cepillados y asas reforzadas. Envio discreto con dust bag.",
  },
  ACCESSORY: {
    en: "Brushed steel timepiece with clean dial proportions. Availability and details confirmed on WhatsApp.",
    pt: "Relogio em aco escovado com mostrador limpo. Disponibilidade confirmada no WhatsApp.",
    es: "Reloj de acero cepillado con esfera limpia. Disponibilidad confirmada por WhatsApp.",
  },
} as const;

type Category = keyof typeof copy;

export const dynamic = "force-dynamic";

type QuoteRequestPayload = {
  imageUrl?: string;
  demoType?: string;
};

export async function POST(request: Request) {
  const payload: QuoteRequestPayload = await request.json().catch(() => ({}));
  const raw = typeof payload.imageUrl === "string" ? payload.imageUrl : "";
  const hint = raw.toLowerCase();

  const requestedType = String(payload.demoType || "").toUpperCase();
  const category: Category =
    requestedType === "FOOTWEAR" ||
    requestedType === "BAG" ||
    requestedType === "ACCESSORY"
      ? (requestedType as Category)
      : hint.includes("shoe") || hint.includes("boot") || hint.includes("sneaker")
        ? "FOOTWEAR"
        : "BAG";

  const internalMsrpUsd =
    category === "FOOTWEAR" ? 780 : category === "BAG" ? 980 : 2400;
  const computed = computeQuoteFromMsrp(internalMsrpUsd);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q-${Date.now()}`;

  return NextResponse.json({
    id,
    category,
    quote_usd: computed.withinAutoBand ? computed.quoteUsd : null,
    status: computed.status,
    marketing_copy: copy[category],
  });
}
