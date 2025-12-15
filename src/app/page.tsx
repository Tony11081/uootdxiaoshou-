"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ContactInfo, CONTACT } from "@/components/contact-info";
import { CartItem, loadCart, saveCart } from "@/lib/cart-storage";
import type { Locale, Quote } from "@/types/quote";

const SALES_WHATSAPP = "+86 134 6224 8923";
const QUOTE_TIMEOUT_MS = 12000;
const MAX_IMAGE_CHARS_FOR_CART = 8000;
const MIN_SCAN_MS = 1200;
const UPLOAD_INPUT_ID = "uootd-upload-input";

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

const clientReviews = [
  {
    name: "Andrea R.",
    location: "Los Angeles",
    channel: "WhatsApp · 2d ago",
    note: "Quote matched the screenshot without haggling. Invoiced and shipped faster than expected.",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60",
  },
  {
    name: "Lena K.",
    location: "Berlin",
    channel: "Email · 5d ago",
    note: "Shared two handbags; got a single WhatsApp thread with combined pricing. Clear on duties/shipping up front.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60&sat=-20",
  },
  {
    name: "Miguel T.",
    location: "Lisbon",
    channel: "Email · 1w ago",
    note: "Size check was optional but they still double-confirmed. Packaging was discreet, no branding.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=60&sat=-15",
  },
  {
    name: "Sofia M.",
    location: "Madrid",
    channel: "WhatsApp · 4d ago",
    note: "Price landed inside the promised band. Felt private and respectful—no follow-up spam.",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=60",
  },
  {
    name: "Calvin H.",
    location: "Singapore",
    channel: "WhatsApp · 3d ago",
    note: "Sent 3 items, got one combined draft. Saved the cart and came back later—data was still there.",
    avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60&sat=-10",
  },
  {
    name: "Priya V.",
    location: "Toronto",
    channel: "WhatsApp · 6d ago",
    note: "They waited for my color confirmation before invoicing. QC pics arrived before ship label—nice reassurance.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=60&sat=-10",
  },
  {
    name: "Noah P.",
    location: "New York",
    channel: "WhatsApp · 1w ago",
    note: "Payment only via PayPal invoice. No surprise fees—taxes/shipping spelled out in chat before I paid.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=60&sat=-10",
  },
] as const;

const caseSnippets = [
  {
    title: "Invoice issued · Paid",
    note: "Order #Q-4220 | Tote | Paid via PayPal · ship label generated",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=60",
  },
  {
    title: "Chat handoff",
    note: "Client confirmed size & color in WhatsApp, received QC shots same day",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60",
  },
] as const;

const brandHighlights = [
  { name: "Hermes", region: "Paris", note: "Silk + calfskin sourcing" },
  { name: "Chanel", region: "Paris", note: "Classic flap + seasonal" },
  { name: "Goyard", region: "Paris", note: "St Louis / Artois" },
  { name: "Celine", region: "Paris", note: "Triomphe line" },
  { name: "Dior", region: "Paris", note: "Book Tote + sneakers" },
  { name: "Louis Vuitton", region: "Paris", note: "Canvas + Capucines" },
  { name: "Rolex", region: "Geneva", note: "Lead time on steel models" },
  { name: "Cartier", region: "Paris", note: "Trinity / Love" },
  { name: "AP", region: "Le Brassus", note: "Royal Oak lead times" },
] as const;

const liveRequests = [
  { city: "NYC", item: "Tote", status: "Fast-track", quote: "$245" },
  { city: "Lisbon", item: "Boots", status: "VIP review", quote: "Pending" },
  { city: "Madrid", item: "Watch", status: "Fast-track", quote: "$379 cap" },
  { city: "Toronto", item: "Crossbody", status: "Fast-track", quote: "$195" },
  { city: "Singapore", item: "Flap bag", status: "VIP review", quote: "Pending" },
] as const;

type LeadForm = {
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
};

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function sanitizeNumber(num: string) {
  return num.replace(/[^\d]/g, "");
}

function fileExt(name: string) {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}

function quoteLabel(quoteUsd: number | null) {
  if (quoteUsd === null) return "VIP Price";
  return `$${formatUsd(quoteUsd)}`;
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
    productName: "Calfskin Ankle Boot",
    detectedMsrpUsd: 780,
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

  const [cart, setCart] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : loadCart(),
  );
  const cartHydrated = useRef(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);
  const [promoSeconds, setPromoSeconds] = useState(900);

  useEffect(() => {
    cartHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!cartHydrated.current) return;

    const ok = saveCart(cart);
    if (!ok && cart.length) {
      setCartError("Could not save list (storage is full). Try clearing old items.");
    } else {
      setCartError(null);
    }
  }, [cart]);

  const view = useMemo(() => {
    if (status === "scanning") return "scanning";
    if (status === "ready" || status === "manual") return "result";
    return "upload";
  }, [status]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromoSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const promoClock = useMemo(() => {
    const m = Math.floor(promoSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (promoSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [promoSeconds]);

  const isFootwear = quote.category?.toUpperCase() === "FOOTWEAR";
  const isFastTrack = quote.status === "FAST_TRACK" && quote.quoteUsd !== null;
  const sizeReady = true;

  const primaryCtaLabel = useMemo(() => {
    return isFastTrack ? "SECURE CHECKOUT" : "CONTACT VIP DESK";
  }, [isFastTrack]);

  const statusBadge = isFastTrack ? "Instant quote" : "Manual review";

  const handleQuoteRequest = async (
    imageUrl: string,
    source: "upload" | "demo" = "upload",
    demoType?: DemoType,
  ) => {
    const startedAt = Date.now();
    setStatus("scanning");
    setError(null);
    setPreview(imageUrl);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, source, demoType }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Quote service failed (${response.status})`);
      }

      const data = await response.json();
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SCAN_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SCAN_MS - elapsed));
      }
      const nextQuote: Quote = {
        id: (data?.id as string) || `quote-${Date.now()}`,
        imageUrl,
        category: (data?.category as string) || "ACCESSORY",
        productName: typeof data?.product_name === "string" ? data.product_name : quote.productName,
        detectedMsrpUsd:
          typeof data?.detected_msrp_usd === "number" ? data.detected_msrp_usd : quote.detectedMsrpUsd,
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
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      setStatus("error");
      setError(
        isAbort
          ? "Quote service timed out. Try again or tap a sample."
          : "Quote service is unavailable. Try again.",
      );
    }
    window.clearTimeout(timeoutId);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    const maxBytes = 10 * 1024 * 1024;
    const ext = fileExt(file.name);
    const typeOk =
      allowedTypes.has(file.type) ||
      (!file.type && allowedExtensions.has(ext));

    if (!typeOk) {
      setError("Please upload a JPG, PNG, or WebP image.");
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

  const openUploadPicker = (event?: { preventDefault?: () => void }) => {
    const input = uploadInputRef.current;
    if (!input) return;
    const showPicker = (input as unknown as { showPicker?: () => void }).showPicker;
    if (typeof showPicker === "function") {
      event?.preventDefault?.();
      showPicker.call(input);
    }
  };

  const buildWhatsAppMessage = () => {
    return [
      "UOOTD | Quote Request",
      `Quote ID: ${quote.id}`,
      `Category: ${quote.category}`,
      quote.productName ? `Product: ${quote.productName}` : null,
      `Quoted Price: ${quote.quoteUsd === null ? "VIP Requested" : `$${formatUsd(quote.quoteUsd)}`}`,
      `Customer PayPal: ${lead.paypal}`,
      `Customer WhatsApp: ${lead.whatsapp}`,
      isFootwear ? `Size: ${lead.size || "N/A"}` : null,
      lead.note?.trim() ? `Note: ${lead.note.trim()}` : null,
      "Screenshot: uploaded via uootd.com",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const buildWhatsAppLink = () => {
    const salesNumber = sanitizeNumber(SALES_WHATSAPP);
    return `https://wa.me/${salesNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  };

  const buildEmailLink = () => {
    const subject = `UOOTD Quote ${quote.id}`;
    const body = buildWhatsAppMessage();
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCheckoutClick = () => {
    if (isFootwear && !sizeReady) return;
    setError(null);
    setLeadOpen(true);
  };

  const handleAddToCart = () => {
    const slimImage =
      quote.imageUrl && quote.imageUrl.length > MAX_IMAGE_CHARS_FOR_CART
        ? ""
        : quote.imageUrl;

    setCart((prev) => {
      if (prev.some((item) => item.id === quote.id)) return prev;
      return [
        ...prev,
        {
          ...quote,
          imageUrl: slimImage,
          size: lead.size,
          addedAt: Date.now(),
        },
      ];
    });
  };

  const buildLeadPayload = (channel: "whatsapp" | "email") => {
    return {
      ...lead,
      quoteId: quote.id,
      category: quote.category,
      productName: quote.productName,
      detectedMsrpUsd: quote.detectedMsrpUsd,
      quoteUsd: quote.quoteUsd,
      status: quote.status,
      channel,
    };
  };

  const captureLead = (channel: "whatsapp" | "email") => {
    setError(null);

    if (!lead.paypal || !lead.whatsapp) {
      setError("PayPal email and WhatsApp are required.");
      return false;
    }

    try {
      const body = JSON.stringify(buildLeadPayload(channel));
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/leads", blob);
      } else {
        void fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  const handleEmailFallback = () => {
    if (!captureLead("email")) return;
    const link = buildEmailLink();
    if (typeof window !== "undefined") {
      window.open(link, "_blank");
    }
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
            <p className="text-sm text-[#4f4635]">Please wait, we are detecting your item…</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.3s]" />
              <span>Analyzing</span>
            </div>
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
          <section
            ref={uploadSectionRef}
            className="glass-card rounded-3xl border border-black/8 bg-white/90 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Limited-time offer
                </p>
                <h3 className="text-xl font-semibold text-[var(--ink)]">
                  10% off your first PayPal invoice
                </h3>
                <p className="text-sm text-[#4f4635]">
                  Applies to invoices opened in this session. No prepayment, PayPal only.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                    Code: UOOTD10
                  </span>
                  <span className="text-xs text-[#5c5345]">Add in chat before invoice is sent.</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">Countdown</p>
                <p className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{promoClock}</p>
                <p className="text-xs text-[#5c5345]">Reserve your slot while live.</p>
              </div>
            </div>
          </section>
        ) : null}

        {view === "upload" ? (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card relative overflow-hidden rounded-3xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f0b06]/70 via-transparent to-[#b39748]/15" />
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
                    <label
                      htmlFor={UPLOAD_INPUT_ID}
                      onClick={(e) => openUploadPicker(e)}
                      className="gold-button cursor-pointer rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                    >
                      Choose image
                    </label>
                  </div>

                  <label
                    onClick={(e) => openUploadPicker(e)}
                    className="mt-3 flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-[#d4af37]/60 bg-gradient-to-br from-white to-[#f5efe2] px-5 py-6 shadow-inner transition hover:shadow-lg"
                  >
                    <input
                      id={UPLOAD_INPUT_ID}
                      ref={uploadInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
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
                      <span>PNG/JPG/WebP | up to 10MB | screenshots work best</span>
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

              <div className="glass-card rounded-3xl p-5 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Assurance
                </p>
                <div className="grid gap-2 text-sm text-[#4f4635] sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>PayPal Buyer Protection — invoice only, zero prepayment</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>TLS encrypted — screenshots stored minimally, auto-delete in 7 days</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>Only through PayPal invoices — no card forms, no wallets</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-3 py-2 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>Data policy: 7-day auto-delete · see Privacy</span>
                  </div>
                </div>
                <p className="text-xs text-[#5c5345]">
                  Includes: QC + discreet packaging. Excludes: shipping/taxes (confirmed on WhatsApp).
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                    What clients say
                  </p>
                  <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                    Verified
                  </span>
                </div>
                <div className="relative h-44 overflow-hidden">
                  <div className="review-track">
                    {[...clientReviews, ...clientReviews].map((review, idx) => (
                      <div
                        key={`${review.name}-${idx}`}
                        className="review-item flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[#4f4635]"
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black/10">
                          <Image
                            src={review.avatar}
                            alt={review.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <p className="font-semibold text-[var(--ink)]">{review.name}</p>
                            <span className="text-[11px] uppercase tracking-[0.14em] text-[#7b6848]">
                              {review.location} · {review.channel}
                            </span>
                          </div>
                          <p className="text-xs text-[#4f4635]">{review.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {view === "upload" ? (
          <section className="glass-card rounded-3xl border border-black/8 bg-white/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Limited-time offer
                </p>
                <h3 className="text-xl font-semibold text-[var(--ink)]">
                  10% off your first PayPal invoice
                </h3>
                <p className="text-sm text-[#4f4635]">
                  Applies to invoices opened in this session. No prepayment, PayPal only.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                    Code: UOOTD10
                  </span>
                  <span className="text-xs text-[#5c5345]">Add in chat before invoice is sent.</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">Countdown</p>
                <p className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{promoClock}</p>
                <p className="text-xs text-[#5c5345]">Reserve your slot while live.</p>
                <button
                  className="mt-2 gold-button rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                  onClick={() =>
                    handleQuoteRequest(demoTiles[0].imageUrl, "demo", demoTiles[0].demoType)
                  }
                >
                  Start with sample
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {view === "upload" ? (
          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-card overflow-hidden rounded-3xl border border-black/8 bg-white/80">
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                    Live sourcing
                  </p>
                  <p className="text-sm text-[#4f4635]">Anonymized recent requests.</p>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                  Live
                </span>
              </div>
              <div className="relative overflow-hidden border-t border-black/5">
                <div className="marquee-track">
                  {[...liveRequests, ...liveRequests].map((req, idx) => (
                    <div key={`${req.city}-${idx}`} className="marquee-item">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#7b6848]">
                        {req.city}
                      </p>
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {req.item}
                      </p>
                      <p className="text-xs text-[#4f4635]">
                        {req.status} · {req.quote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                    Brand focus
                  </p>
                  <p className="text-sm text-[#4f4635]">
                    Current house mix by region.
                  </p>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                  Dynamic
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {brandHighlights.slice(0, 6).map((brand) => (
                  <div
                    key={brand.name}
                    className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7b6848]">
                      {brand.region}
                    </p>
                    <p className="text-sm font-semibold text-[var(--ink)]">{brand.name}</p>
                    <p className="text-xs text-[#4f4635]">{brand.note}</p>
                  </div>
                ))}
              </div>
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
                <p className="text-sm text-[#4f4635]">
                  Private quote based on detected MSRP (capped as needed).
                </p>
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
                    {quote.productName ? (
                      <p className="text-sm text-[#f3e5b8]">{quote.productName}</p>
                    ) : null}
                    {!isFastTrack ? (
                      <p className="mt-1 text-sm font-semibold text-[#f3e5b8]">
                        Contact for VIP Price
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <div className="text-sm text-[#4f4635]">
                    {quote.productName ? (
                      <p className="font-semibold text-[var(--ink)]">
                        {quote.productName}
                      </p>
                    ) : null}
                  </div>

                  <p className="text-sm text-[#4f4635]">
                    {quote.marketingCopy?.[locale] || quote.marketingCopy?.en}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-[#4f4635] sm:grid-cols-4">
                    {[
                      { label: "Quote", desc: "~3s" },
                      { label: "Confirm", desc: "Client chat" },
                      { label: "Invoice", desc: "PayPal" },
                      { label: "Ship", desc: "QC + discreet pack" },
                    ].map((step) => (
                      <div
                        key={step.label}
                        className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 text-center shadow-sm"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                          {step.label}
                        </p>
                        <p className="text-sm text-[var(--ink)]">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  {isFootwear ? (
                    <SizeSelect
                      value={lead.size}
                      onChange={(value) =>
                        setLead((prev) => ({ ...prev, size: value }))
                      }
                    />
                  ) : null}

                  <div className="flex flex-wrap gap-3">
              <button
                className="gold-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCheckoutClick}
                disabled={false}
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

            <div className="glass-card rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                    What clients say
                  </p>
                  <p className="text-sm text-[#4f4635]">
                    Real buyers, verified chats.
                  </p>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                  Verified
                </span>
              </div>
              <div className="relative mt-3 h-48 overflow-hidden">
                <div className="review-track">
                  {[...clientReviews, ...clientReviews].map((review, idx) => (
                    <div
                      key={`${review.name}-${idx}`}
                      className="review-item flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[#4f4635]"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black/10">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {review.name}
                          </p>
                          <span className="text-[11px] uppercase tracking-[0.14em] text-[#7b6848]">
                            {review.location} · {review.channel}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#4f4635]">{review.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Brand focus
                </p>
                <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                  Dynamic
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {brandHighlights.slice(0, 6).map((brand) => (
                  <div
                    key={brand.name}
                    className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7b6848]">
                      {brand.region}
                    </p>
                    <p className="text-sm font-semibold text-[var(--ink)]">{brand.name}</p>
                    <p className="text-xs text-[#4f4635]">{brand.note}</p>
                  </div>
                ))}
              </div>
            </div>

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

            <Accordion title="Policy & SLA">
              <div className="grid gap-3 text-sm text-[#4f4635] sm:grid-cols-2">
                <div className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b6848]">
                    Response
                  </p>
                  <p>Business hours: ~10 min. Off-hours: next window.</p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b6848]">
                    Edits / cancel
                  </p>
                  <p>Before invoice: free edits/cancel. After invoice: confirm in chat.</p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b6848]">
                    QC
                  </p>
                  <p>Photos or short video before shipping. Sourced discreetly.</p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b6848]">
                    Privacy & retention
                  </p>
                  <p>
                    Screenshots used only for quotes. Auto-delete after 7 days. TLS encrypted storage.
                  </p>
                </div>
              </div>
            </Accordion>

            <Accordion title="Case snapshots">
              <div className="grid gap-3 sm:grid-cols-2">
                {caseSnippets.map((c) => (
                  <div
                    key={c.title}
                    className="overflow-hidden rounded-2xl border border-black/8 bg-white/80 shadow-sm"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover blur-[1px]"
                        sizes="100%"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                        {c.title}
                      </div>
                    </div>
                    <div className="px-3 py-3 text-sm text-[#4f4635]">{c.note}</div>
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
              {cartError ? (
                <p className="text-sm font-semibold text-[#9a3b3b]">{cartError}</p>
              ) : null}

              <a
                href={buildWhatsAppLink()}
                className="gold-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                onClick={(e) => {
                  if (!captureLead("whatsapp")) {
                    e.preventDefault();
                    return;
                  }
                  setLeadOpen(false);
                }}
              >
                Continue in WhatsApp
              </a>
              <button
                className="outline-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
                onClick={handleEmailFallback}
              >
                Email us (if WhatsApp is blocked)
              </button>
              <p className="text-xs text-[#5c5345]">
                Privacy: your screenshot is used only to prepare your quote.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="sticky top-[56px] z-30 flex justify-center px-4 pb-4">
        <div className="glass-card flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2 text-xs text-[#4f4635] shadow-lg">
          <span className="font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
            Need help?
          </span>
          <a
            href={`https://wa.me/${CONTACT.whatsappDigits}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted"
          >
            WhatsApp
          </a>
          <span>•</span>
          <a href={`mailto:${CONTACT.email}`} className="underline decoration-dotted">
            Email
          </a>
          <span>Response: ~10 min in business hours</span>
        </div>
      </div>
    </div>
  );
}
