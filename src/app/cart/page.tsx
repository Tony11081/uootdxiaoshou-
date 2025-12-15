"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartItem, loadCart, saveCart } from "@/lib/cart-storage";

const SALES_WHATSAPP = "+8613462248923";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=60";

const NORMAL_TIER_MULTIPLIER = 0.65;
const NORMAL_TIER_FLOOR_USD = 90;

function sanitizeNumber(num: string) {
  return num.replace(/[^\d]/g, "");
}

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function quoteLabel(quoteUsd: number | null | undefined) {
  if (typeof quoteUsd === "number") return `$${formatUsd(quoteUsd)}`;
  if (quoteUsd === null) return "VIP Price";
  return "—";
}

function computeNormalQuoteUsd(premiumUsd: number | null | undefined): number | null {
  if (typeof premiumUsd !== "number" || !Number.isFinite(premiumUsd)) return null;
  const raw = premiumUsd * NORMAL_TIER_MULTIPLIER;
  return Math.round(Math.max(NORMAL_TIER_FLOOR_USD, raw));
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : loadCart(),
  );
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveCart(cart);
  }, [cart]);

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setCart([]);
  };

  const setTier = (id: string, tier: "premium" | "normal") => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const premium = item.quoteUsd ?? null;
        const normal =
          typeof item.normalQuoteUsd === "number"
            ? item.normalQuoteUsd
            : computeNormalQuoteUsd(premium);
        const selected = tier === "normal" ? normal : premium;
        return {
          ...item,
          normalQuoteUsd: typeof item.normalQuoteUsd === "number" ? item.normalQuoteUsd : normal,
          selectedTier: tier,
          selectedQuoteUsd: selected ?? null,
        };
      }),
    );
  };

  const totals = useMemo(() => {
    const premiumTotal = cart.reduce(
      (sum, item) => sum + (typeof item.quoteUsd === "number" ? item.quoteUsd : 0),
      0,
    );
    const normalTotal = cart.reduce((sum, item) => {
      const normal =
        typeof item.normalQuoteUsd === "number"
          ? item.normalQuoteUsd
          : computeNormalQuoteUsd(item.quoteUsd);
      return sum + (typeof normal === "number" ? normal : 0);
    }, 0);
    const selectedTotal = cart.reduce((sum, item) => {
      const tier = item.selectedTier === "normal" ? "normal" : "premium";
      const normal =
        typeof item.normalQuoteUsd === "number"
          ? item.normalQuoteUsd
          : computeNormalQuoteUsd(item.quoteUsd);
      const selected =
        typeof item.selectedQuoteUsd === "number"
          ? item.selectedQuoteUsd
          : tier === "normal"
            ? normal
            : item.quoteUsd;
      return sum + (typeof selected === "number" ? selected : 0);
    }, 0);
    const vipCount = cart.filter((item) => item.quoteUsd === null).length;
    return { premiumTotal, normalTotal, selectedTotal, vipCount };
  }, [cart]);

  const waLink = useMemo(() => {
    const lines = cart.map((item, idx) => {
      const premiumText =
        item.quoteUsd === null
          ? "VIP requested"
          : typeof item.quoteUsd === "number"
            ? `$${formatUsd(item.quoteUsd)}`
            : "—";
      const normalUsd =
        typeof item.normalQuoteUsd === "number"
          ? item.normalQuoteUsd
          : computeNormalQuoteUsd(item.quoteUsd);
      const normalText =
        normalUsd === null
          ? "VIP requested"
          : typeof normalUsd === "number"
            ? `$${formatUsd(normalUsd)}`
            : "—";
      const tier = item.selectedTier === "normal" ? "NORMAL" : "PREMIUM";
      const selectedUsd =
        typeof item.selectedQuoteUsd === "number"
          ? item.selectedQuoteUsd
          : tier === "NORMAL"
            ? normalUsd
            : item.quoteUsd;
      const selectedText =
        selectedUsd === null
          ? "VIP requested"
          : typeof selectedUsd === "number"
            ? `$${formatUsd(selectedUsd)}`
            : "—";
      const size = item.size ? ` | Size: ${item.size}` : "";
      const name = item.productName ? ` - ${item.productName}` : "";
      return `${idx + 1}. Quote ID: ${item.id}${name} | Selected ${tier}: ${selectedText} | Premium: ${premiumText} | Normal: ${normalText}${size}`;
    });

    const message = [
      "UOOTD | Batch Request",
      ...lines,
      `Selected total (non-VIP): $${formatUsd(totals.selectedTotal)}`,
      `Premium total (non-VIP): $${formatUsd(totals.premiumTotal)}`,
      `Normal total (non-VIP): $${formatUsd(totals.normalTotal)}`,
      totals.vipCount ? `VIP Review Items: ${totals.vipCount}` : null,
      "Customer PayPal: <fill>",
      "Customer WhatsApp: <fill>",
    ]
      .filter(Boolean)
      .join("\n");

    const salesNumber = sanitizeNumber(SALES_WHATSAPP);
    return `https://wa.me/${salesNumber}?text=${encodeURIComponent(message)}`;
  }, [cart, totals.selectedTotal, totals.premiumTotal, totals.normalTotal, totals.vipCount]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-12 sm:px-8 lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD | Batch Checkout
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          Sourcing List
        </h1>
        <p className="text-sm text-[#5c5345]">
          Review multiple items, then launch a single WhatsApp draft to confirm
          details.
        </p>
      </div>

      {cart.length ? (
        <div className="grid gap-4">
          {cart.map((item) => {
            const isFastTrack =
              item.status === "FAST_TRACK" && item.quoteUsd !== null;
            const hasImage = Boolean(item.imageUrl);
            const tier = item.selectedTier === "normal" ? "normal" : "premium";
            const premium = item.quoteUsd ?? null;
            const normal =
              typeof item.normalQuoteUsd === "number"
                ? item.normalQuoteUsd
                : computeNormalQuoteUsd(premium);
            const selected =
              typeof item.selectedQuoteUsd === "number"
                ? item.selectedQuoteUsd
                : tier === "normal"
                  ? normal
                  : premium;
            return (
              <div
                key={item.id}
                className="glass-card flex flex-wrap items-center gap-4 rounded-3xl p-4"
              >
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hasImage ? item.imageUrl : FALLBACK_IMAGE}
                    alt={item.category}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.16em] text-[#7b6848]">
                    {item.category}
                  </p>
                {item.productName ? (
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {item.productName}
                  </p>
                ) : null}
                <p className="text-lg font-semibold text-[var(--ink)]">
                  Selected ({tier.toUpperCase()}): {quoteLabel(selected)}
                </p>
                <p className="text-xs text-[#5c5345]">
                  Premium {quoteLabel(premium)} · Normal {quoteLabel(normal)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTier(item.id, "premium")}
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      tier === "premium"
                        ? "bg-black text-[#fef7d2]"
                        : "border border-black/10 bg-white/70 text-[#4f4635] hover:bg-white"
                    }`}
                  >
                    Premium
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier(item.id, "normal")}
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      tier === "normal"
                        ? "bg-black text-[#fef7d2]"
                        : "border border-black/10 bg-white/70 text-[#4f4635] hover:bg-white"
                    }`}
                  >
                    Normal
                  </button>
                </div>
                {item.size ? (
                  <p className="text-xs text-[#5c5345]">Size: {item.size}</p>
                ) : null}
              </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      isFastTrack
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isFastTrack ? "Fast Track" : "VIP Review"}
                  </span>
                  <button
                    className="outline-button rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 text-sm text-[#4f4635]">
          Your sourcing list is empty. Add items from the quote screen, then
          return here for batch checkout.
        </div>
      )}

      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
            Totals
          </p>
          <p className="text-lg font-semibold text-[var(--ink)]">
            Selected: ${formatUsd(totals.selectedTotal)}
          </p>
          <p className="text-xs text-[#5c5345]">
            Premium: ${formatUsd(totals.premiumTotal)} · Normal: ${formatUsd(totals.normalTotal)}
          </p>
          {totals.vipCount ? (
            <p className="text-xs text-[#5c5345]">
              VIP review items: {totals.vipCount}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {cart.length ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="gold-button rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Launch WhatsApp Draft
            </a>
          ) : (
            <button
              disabled
              className="gold-button rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] opacity-60 cursor-not-allowed"
            >
              Launch WhatsApp Draft
            </button>
          )}
          {cart.length ? (
            <button
              onClick={clearAll}
              className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Clear all
            </button>
          ) : null}
          <Link
            href="/"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Back to Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
