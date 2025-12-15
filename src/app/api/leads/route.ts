import { NextResponse } from "next/server";
import { addLead, deleteLead, listLeadsWithSource } from "@/server/leads-store";
import { getSession } from "@/server/auth";
import { deleteQuoteAsset } from "@/server/assets-store";
import { computeNormalQuoteFromPremium } from "@/server/pricing";

export const dynamic = "force-dynamic";

function toNumber(input: unknown) {
  const num = typeof input === "number" ? input : Number(input);
  return Number.isFinite(num) ? num : null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leads, source } = await listLeadsWithSource();
  return NextResponse.json({ leads, source, count: leads.length });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const channel =
    payload.channel === "whatsapp" ||
    payload.channel === "email" ||
    payload.channel === "manual"
      ? payload.channel
      : undefined;

  const paypal = typeof payload.paypal === "string" ? payload.paypal.trim() : "";
  const whatsapp = typeof payload.whatsapp === "string" ? payload.whatsapp.trim() : "";

  if (!paypal || !whatsapp) {
    return NextResponse.json({ error: "PayPal and WhatsApp are required" }, { status: 400 });
  }

  if (channel === "manual") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const premiumQuoteUsd = payload.quoteUsd === null ? null : toNumber(payload.quoteUsd);
  const normalQuoteUsd = (() => {
    if (premiumQuoteUsd === null) return null;
    const candidate = payload.normalQuoteUsd;
    if (candidate === null) return null;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === "string" && candidate.trim()) {
      const parsed = toNumber(candidate);
      if (parsed !== null) return parsed;
    }
    return computeNormalQuoteFromPremium(premiumQuoteUsd);
  })();

  const tierRaw = typeof payload.selectedTier === "string" ? payload.selectedTier : "";
  const tierValue = tierRaw.trim().toLowerCase();
  const selectedTier = tierValue === "normal" ? "normal" : "premium";
  const selectedQuoteUsd = selectedTier === "normal" ? normalQuoteUsd : premiumQuoteUsd;

  const record = await addLead({
    paypal,
    whatsapp,
    size: typeof payload.size === "string" ? payload.size : undefined,
    note: typeof payload.note === "string" ? payload.note : undefined,
    quoteId: typeof payload.quoteId === "string" ? payload.quoteId : undefined,
    category: typeof payload.category === "string" ? payload.category : undefined,
    productName: typeof payload.productName === "string" ? payload.productName : undefined,
    detectedMsrpUsd: toNumber(payload.detectedMsrpUsd),
    quoteUsd: premiumQuoteUsd,
    normalQuoteUsd,
    selectedTier,
    selectedQuoteUsd,
    status: typeof payload.status === "string" ? payload.status : undefined,
    channel,
    imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
    sourceIp: request.headers.get("x-forwarded-for") || undefined,
  });

  return NextResponse.json({ ok: true, lead: record }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const paramId = url.searchParams.get("id");
  const quoteId = url.searchParams.get("quoteId");
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const bodyId = typeof body.id === "string" ? body.id : null;
  const id = paramId || bodyId;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await deleteLead(id);
  if (ok && quoteId) {
    await deleteQuoteAsset(quoteId).catch(() => {});
  }
  return NextResponse.json({ ok });
}
