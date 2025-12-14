"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ContactInfo } from "@/components/contact-info";
import type { Locale, Quote } from "@/types/quote";

const SALES_WHATSAPP = "+86 134 6224 8923";
const STORAGE_CART_KEY = "uootd_cart_v1";
const AUTO_DELETE_DAYS = 7;

const expectationLine: Record<Locale, string> = {
  en: "Most items get an instant quote. If an instant quote isn’t available, an insider replies on WhatsApp.",
  pt: "A maioria dos itens recebe cotacao instantanea. Se nao estiver disponivel, um insider responde no WhatsApp.",
  es: "La mayoria de articulos reciben cotizacion instantanea. Si no esta disponible, un insider responde por WhatsApp.",
};

const demoTiles = [
  {
    demoType: "FOOTWEAR",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    label: {
      en: "Footwear (size required)",
      pt: "Calcado (tamanho)",
      es: "Calzado (talla)",
    },
  },
  {
    demoType: "BAG",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    label: { en: "Bags (fast track)", pt: "Bolsas (fast track)", es: "Bolsos (fast track)" },
  },
  {
    demoType: "ACCESSORY",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    label: { en: "Accessories", pt: "Acessorios", es: "Accesorios" },
  },
] as const;

type DemoType = (typeof demoTiles)[number]["demoType"];

const steps = [
  { num: "01", title: "See it", desc: "Screenshot any piece you want sourced." },
  { num: "02", title: "Upload it", desc: "Upload or try a 1-click sample." },
  {
    num: "03",
    title: "Private quote",
    desc: "Most items quote instantly; VIP review when needed.",
  },
] as const;

const craftWall = [
  "Calfskin",
  "Saffiano",
  "Box leather",
  "Suede",
  "Brushed hardware",
  "Hand stitching",
  "Edge paint",
  "Lined interior",
  "Dust bag",
] as const;

const verdicts = [
  {
    name: "Erin - NYC",
    statement:
      "Quick, discreet, and the WhatsApp confirmation flow was smooth. Felt premium end-to-end.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Lucas - Sao Paulo",
    statement:
      "Footwear sizing prompt was clear. Got the details confirmed fast without back-and-forth.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Valeria - Madrid",
    statement:
      "Screenshot to quote was effortless. The pre-filled WhatsApp draft saved time.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
] as const;

type LeadForm = {
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
};

type CartItem = Quote & { size?: string; addedAt?: number };

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function sanitizeNumber(num: string) {
  return num.replace(/[^\d]/g, "");
}

function quoteLabel(quoteUsd: number | null) {
  if (quoteUsd === null) return "VIP Price";
  return `$${formatUsd(quoteUsd)}`;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const maxAgeMs = AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000;

    return (parsed as CartItem[])
      .map((item) => ({
        ...item,
        addedAt: typeof item.addedAt === "number" ? item.addedAt : now,
      }))
      .filter((item) => now - (item.addedAt || now) <= maxAgeMs);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="glass-card rounded-3xl p-5"
      open={defaultOpen ? true : undefined}
    >
      <summary className="cursor-pointer list-none select-none text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
        {title}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function SizeSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const sizes = [
    "EU 35",
    "EU 36",
    "EU 37",
    "EU 38",
    "EU 39",
    "EU 40",
    "EU 41",
    "EU 42",
    "EU 43",
    "EU 44",
    "EU 45",
    "EU 46",
  ];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[var(--ink)]">Size</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
      >
        <option value="">Select size</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
        <option value="Not sure">Not sure</option>
      </select>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");

  const [quote, setQuote] = useState<Quote>({
    id: "demo-offer",
    imageUrl: demoTiles[0].imageUrl,
    category: "FOOTWEAR",
    quoteUsd: 195,
    marketingCopy: {
      en: "Hand-finished calfskin boot with atelier-grade stitching. Ships discreetly with dust bag and double-boxed packaging.",
      pt: "Bota em couro com costura de atelier. Envio discreto com dust bag e embalagem dupla.",
      es: "Bota de piel con costuras de atelier. Envio discreto con dust bag y embalaje doble.",
    },
    status: "FAST_TRACK",
  });

  const [status, setStatus] = useState<
    "idle" | "scanning" | "ready" | "manual" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(demoTiles[0].imageUrl);

  const [leadOpen, setLeadOpen] = useState(false);
  const [lead, setLead] = useState<LeadForm>({ paypal: "", whatsapp: "" });

  const [cart, setCart] = useState<CartItem[]>([]);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setCart(loadCart());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const view = useMemo(() => {
    if (status === "scanning") return "scanning";
    if (status === "ready" || status === "manual") return "result";
    return "upload";
  }, [status]);

  const isFootwear = quote.category?.toUpperCase() === "FOOTWEAR";
  const isFastTrack = quote.status === "FAST_TRACK" && quote.quoteUsd !== null;
  const sizeReady = !isFootwear || Boolean(lead.size?.trim());

  const primaryCtaLabel = useMemo(() => {
    if (isFootwear && !sizeReady) return "Select size to checkout";
    return isFastTrack ? "SECURE CHECKOUT" : "CONTACT VIP DESK";
  }, [isFastTrack, isFootwear, sizeReady]);

  const statusBadge = isFastTrack ? "Instant quote" : "Manual review";

  const handleQuoteRequest = async (
    imageUrl: string,
    source: "upload" | "demo" = "upload",
    demoType?: DemoType,
  ) => {
    setStatus("scanning");
    setError(null);
    setPreview(imageUrl);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, source, demoType }),
      });

      if (!response.ok) throw new Error("Quote service failed");

      const data = await response.json();
      const nextQuote: Quote = {
        id: (data?.id as string) || `quote-${Date.now()}`,
        imageUrl,
        category: (data?.category as string) || "ACCESSORY",
        quoteUsd: typeof data?.quote_usd === "number" ? data.quote_usd : null,
        marketingCopy: data?.marketing_copy || quote.marketingCopy,
        status:
          data?.status === "FAST_TRACK" || data?.status === "VIP_REVIEW"
            ? data.status
            : typeof data?.quote_usd === "number"
              ? "FAST_TRACK"
              : "VIP_REVIEW",
      };

      setQuote(nextQuote);
      setStatus(nextQuote.status === "FAST_TRACK" ? "ready" : "manual");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Quote service is unavailable. Try again.");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = new Set(["image/jpeg", "image/png"]);
    const maxBytes = 10 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      setError("Please upload a PNG or JPG image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxBytes) {
      setError("Max file size is 10MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = (e.target?.result as string) || "";
      handleQuoteRequest(url, "upload");
    };
    reader.readAsDataURL(file);
  };

  const buildWhatsAppLink = () => {
    const salesNumber = sanitizeNumber(SALES_WHATSAPP);
    const message = [
      "UOOTD | Quote Request",
      `Quote ID: ${quote.id}`,
      `Category: ${quote.category}`,
      `Quoted Price: ${quote.quoteUsd === null ? "VIP Requested" : `$${formatUsd(quote.quoteUsd)}`}`,
      `Customer PayPal: ${lead.paypal}`,
      `Customer WhatsApp: ${lead.whatsapp}`,
      isFootwear ? `Size: ${lead.size || "N/A"}` : null,
      lead.note?.trim() ? `Note: ${lead.note.trim()}` : null,
      `Image: ${quote.imageUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${salesNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckoutClick = () => {
    if (isFootwear && !sizeReady) return;
    setError(null);
    setLeadOpen(true);
  };

  const handleAddToCart = () => {
    setCart((prev) => {
      if (prev.some((item) => item.id === quote.id)) return prev;
      return [...prev, { ...quote, size: lead.size, addedAt: Date.now() }];
    });
  };

  const handleLeadSubmit = async () => {
    setError(null);

    if (!lead.paypal || !lead.whatsapp) {
      setError("PayPal email and WhatsApp are required.");
      return;
    }

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          quoteId: quote.id,
          category: quote.category,
          quoteUsd: quote.quoteUsd,
          status: quote.status,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    window.open(buildWhatsAppLink(), "_blank");
    setLeadOpen(false);
  };

  const handleReset = () => {
    setStatus("idle");
    setError(null);
    setLeadOpen(false);
    setLead((prev) => ({ ...prev, size: undefined, note: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (view === "scanning") {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden px-4 py-12 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-35">
            <Image
              src={preview}
              alt="Scanning background"
              fill
              className="object-cover blur-2xl scale-110"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-[rgba(17,17,17,0.55)]" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.32em] text-[#f3e5b8]">
            UOOTD | Insider Channel
          </p>
          <div className="glass-card rounded-3xl p-7">
            <div className="flex items-center gap-3">
              <div className="scanner-dot" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
                Scanning in progress
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              Estimated time: ~3 seconds
            </p>
            <div className="mt-4 scanner-rail h-2 rounded-full bg-black/5" />
            <p className="mt-4 text-sm text-[#4f4635]">
              Privacy: your screenshot is used only to prepare your quote.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-28 pt-10 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-20%] h-[520px] bg-gradient-to-b from-[rgba(17,17,17,0.12)] via-transparent to-transparent blur-3xl" />
        <div className="absolute left-[15%] top-[10%] h-32 w-32 rounded-full bg-[#d4af37]/30 blur-3xl" />
        <div className="absolute right-[8%] top-[12%] h-24 w-24 rounded-full bg-[#111111]/10 blur-2xl" />
      </div>

      <header className="relative z-10 mb-8 flex flex-col gap-4 sm:items-center sm:justify-between sm:flex-row">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
            UOOTD | Insider Channel
          </p>
          <h1 className="font-[var(--font-playfair)] text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
            See it. Screenshot it. Upload it.
          </h1>
          <p className="text-sm text-[#4f4635]">
            Private quotes in under 3 seconds.
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
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10">
        {view === "upload" ? (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card relative overflow-hidden rounded-3xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f0b06]/80 via-transparent to-[#b39748]/5" />
              <div className="relative flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  How it works
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {steps.map((step) => (
                    <div
                      key={step.num}
                      className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm"
                    >
                      <div className="text-lg font-semibold text-[#7b6848]">
                        {step.num}
                      </div>
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {step.title}
                      </p>
                      <p className="text-xs text-[#5c5345]">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-[#d4af37]/60 bg-white/70 p-4 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                        Upload screenshot
                      </p>
                      <p className="text-lg font-semibold text-[var(--ink)]">
                        Discreet scanner with gold rail animation.
                      </p>
                    </div>
                    <button
                      className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                      onClick={() => uploadInputRef.current?.click()}
                    >
                      Choose image
                    </button>
                  </div>

                  <label className="mt-3 flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-[#d4af37]/60 bg-gradient-to-br from-white to-[#f5efe2] px-5 py-6 shadow-inner transition hover:shadow-lg">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex items-center gap-3">
                      <div className="scanner-rail h-1 flex-1 rounded-full bg-black/5" />
                      <div className="text-xs uppercase tracking-[0.18em] text-[#7b6848]">
                        Upload screenshot
                      </div>
                    </div>
                    <p className="text-sm text-[#5c5345]">
                      Upload a product screenshot to request a private quote.
                      Pricing can vary by size, material, and availability.
                    </p>
                    <p className="text-xs text-[#5c5345]">
                      {expectationLine[locale]}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5c5345]">
                      <span>PNG/JPG | up to 10MB | screenshots work best</span>
                      <span
                        className="cursor-help underline decoration-dotted"
                        title="Include the full item and any visible logo/hardware."
                      >
                        Tip
                      </span>
                    </div>
                    <p className="text-xs text-[#5c5345]">
                      Private by default. Screenshots are never posted.
                      Auto-deleted after 7 days.{" "}
                      <Link
                        href="/privacy"
                        className="font-semibold text-[#7b6848] hover:text-black"
                      >
                        Privacy
                      </Link>{" "}
                      /{" "}
                      <Link
                        href="/terms"
                        className="font-semibold text-[#7b6848] hover:text-black"
                      >
                        Terms
                      </Link>
                    </p>
                    <p className="text-xs text-[#5c5345]">
                      No login. No spam. Just a private quote.
                    </p>
                    {error ? (
                      <p className="text-sm font-semibold text-[#9a3b3b]">
                        {error}
                      </p>
                    ) : null}
                  </label>

                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7b6848]">
                      1-click samples
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {demoTiles.map((tile) => (
                        <button
                          key={tile.demoType}
                          className="group overflow-hidden rounded-2xl border border-black/10 bg-white/70 text-left shadow-sm transition hover:shadow-lg"
                          onClick={() =>
                            handleQuoteRequest(
                              tile.imageUrl,
                              "demo",
                              tile.demoType,
                            )
                          }
                        >
                          <div className="relative h-20 w-full overflow-hidden">
                            <Image
                              src={tile.imageUrl}
                              alt={tile.label[locale]}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(min-width: 1024px) 250px, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fef7d2]">
                              {tile.label[locale]}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="glass-card rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Trust
                </p>
                <div className="mt-3 grid gap-2 text-sm text-[#4f4635]">
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>Discreet packaging</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>PayPal invoice only</span>
                  </div>
                </div>
              </div>

              <ContactInfo locale={locale} />

              <Accordion title="FAQ">
                <div className="space-y-3 text-sm text-[#4f4635]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                      Why WhatsApp?
                    </p>
                    <p>
                      Fastest way to confirm size, color, and availability before
                      invoicing.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                      Why PayPal email?
                    </p>
                    <p>Used only to send your invoice.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                      What if instant quote isn&apos;t available?
                    </p>
                    <p>We route it to VIP review and reply on WhatsApp.</p>
                  </div>
                </div>
              </Accordion>
            </div>
          </section>
        ) : null}
        {view === "result" ? (
          <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
                  Your quote
                </p>
                <h2 className="text-3xl font-semibold text-[var(--ink)]">
                  Result & checkout
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                  onClick={handleReset}
                >
                  Upload another
                </button>
                <Link
                  href="/cart"
                  className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                >
                  Sourcing List ({cart.length})
                </Link>
              </div>
            </div>

            <div className="glass-card overflow-hidden rounded-3xl p-0">
              <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
                <div className="relative min-h-[360px] overflow-hidden bg-black">
                  <Image
                    src={quote.imageUrl}
                    alt="Quoted item"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority
                  />
                  <div className="vignette absolute inset-0" />
                  <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e5b8]">
                    {quote.category}
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#111] shadow-sm">
                    {statusBadge}
                  </div>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                      Quoted Price
                    </p>
                    <p className="text-4xl font-semibold text-[#fef7d2]">
                      {quoteLabel(quote.quoteUsd)}
                    </p>
                    {!isFastTrack ? (
                      <p className="mt-1 text-sm font-semibold text-[#f3e5b8]">
                        Contact for VIP Price
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <p className="text-sm text-[#4f4635]">
                    {quote.marketingCopy?.[locale] || quote.marketingCopy?.en}
                  </p>

                  {isFootwear ? (
                    <SizeSelect
                      value={lead.size}
                      onChange={(value) =>
                        setLead((prev) => ({ ...prev, size: value }))
                      }
                    />
                  ) : null}

                  {isFootwear && !sizeReady ? (
                    <p className="text-sm font-semibold text-[#7a6845]">
                      Select size to checkout
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="gold-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleCheckoutClick}
                      disabled={!sizeReady}
                    >
                      {primaryCtaLabel}
                    </button>
                    <button
                      className="outline-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
                      onClick={handleAddToCart}
                    >
                      Add to Sourcing List
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs text-[#5c5345] sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                      <span>Discreet packaging</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                      <span>PayPal invoice only</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5c5345] sm:grid-cols-4">
                    {[
                      "Quote",
                      "Checkout",
                      "WhatsApp confirm",
                      "PayPal invoice",
                    ].map((label, idx) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            idx === 0 ? "bg-[#d4af37]" : "bg-black/15"
                          }`}
                        />
                        <span className="text-center leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>

                  {error ? (
                    <p className="text-sm font-semibold text-[#9a3b3b]">{error}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <Accordion title="Details" defaultOpen>
              <div className="space-y-2 text-sm text-[#4f4635]">
                <p>Includes: sourcing + QC + discreet packaging</p>
                <p>Excludes: shipping/taxes (confirmed on WhatsApp)</p>
              </div>
            </Accordion>

            <Accordion title="The Insider Verdict">
              <div className="space-y-3">
                {verdicts.map((v) => (
                  <div
                    key={v.name}
                    className="flex gap-3 rounded-2xl border border-black/8 bg-white/80 p-3 shadow-sm"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={v.image}
                        alt={v.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {v.name}
                        </p>
                        <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5c5345]">
                          Verified Request
                        </span>
                      </div>
                      <p className="text-xs text-[#5c5345]">{v.statement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Materials & Craft">
              <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-[#433b2d] sm:grid-cols-3">
                {craftWall.map((word) => (
                  <div
                    key={word}
                    className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 text-center shadow-sm"
                  >
                    {word}
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Contact">
              <ContactInfo embedded locale={locale} />
            </Accordion>
          </section>
        ) : null}
      </main>

      {view === "result" ? (
        <div className="fixed inset-x-0 bottom-4 z-30 px-4 sm:px-8 lg:px-12">
          <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3 shadow-xl">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b6848]">
                {statusBadge}
              </p>
              <p className="text-lg font-semibold text-[var(--ink)]">
                {quoteLabel(quote.quoteUsd)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="gold-button rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCheckoutClick}
                disabled={!sizeReady}
              >
                {primaryCtaLabel}
              </button>
              <Link
                href="/cart"
                className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
              >
                List ({cart.length})
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {leadOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-card relative w-full max-w-lg rounded-3xl p-6">
            <button
              className="absolute right-3 top-3 text-sm text-[#7b6848]"
              onClick={() => setLeadOpen(false)}
            >
              Close
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
              Secure capture
            </p>
            <h3 className="text-2xl font-semibold text-[var(--ink)]">
              Before WhatsApp, confirm your contact details.
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#5c5345]">
              <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                <span>Discreet packaging</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                <span>PayPal invoice only</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  PayPal Email
                </label>
                <input
                  type="email"
                  className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  placeholder="customer@paypal.com"
                  value={lead.paypal}
                  onChange={(e) => setLead({ ...lead, paypal: e.target.value })}
                  required
                />
                <p className="text-xs text-[#5c5345]">
                  Used only to send your invoice (we don&apos;t store payment
                  details).
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  placeholder="+86 13x xxxx xxxx"
                  value={lead.whatsapp}
                  onChange={(e) =>
                    setLead({ ...lead, whatsapp: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-[#5c5345]">
                  Used to confirm size/color/availability (fastest channel).
                </p>
              </div>

              {isFootwear ? (
                <SizeSelect
                  value={lead.size}
                  onChange={(value) =>
                    setLead((prev) => ({ ...prev, size: value }))
                  }
                />
              ) : null}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  className="resize-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  placeholder="Leave a note for our desk (color, material, preferred timeline, etc.)"
                  value={lead.note || ""}
                  onChange={(e) => setLead({ ...lead, note: e.target.value })}
                />
              </div>

              {error ? (
                <p className="text-sm font-semibold text-[#9a3b3b]">{error}</p>
              ) : null}

              <button
                className="gold-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                onClick={handleLeadSubmit}
              >
                Continue in WhatsApp
              </button>
              <p className="text-xs text-[#5c5345]">
                Privacy: your screenshot is used only to prepare your quote.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
