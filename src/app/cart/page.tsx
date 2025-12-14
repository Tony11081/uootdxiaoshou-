"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Quote } from "@/types/quote";

const SALES_WHATSAPP = "+8613462248923";
const STORAGE_CART_KEY = "uootd_cart_v1";
const AUTO_DELETE_DAYS = 7;

type CartItem = Quote & { size?: string; addedAt?: number };

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

function sanitizeNumber(num: string) {
  return num.replace(/[^\d]/g, "");
}

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function quoteLabel(quoteUsd: number | null) {
  if (quoteUsd === null) return "VIP Price";
  return `$${formatUsd(quoteUsd)}`;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setCart(loadCart());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setCart([]);
  };

  const totals = useMemo(() => {
    const fastTrackTotal = cart.reduce(
      (sum, item) => sum + (item.quoteUsd ?? 0),
      0,
    );
    const vipCount = cart.filter((item) => item.quoteUsd === null).length;
    return { fastTrackTotal, vipCount };
  }, [cart]);

  const waLink = useMemo(() => {
    const lines = cart.map((item, idx) => {
      const price =
        item.quoteUsd === null ? "VIP requested" : `$${formatUsd(item.quoteUsd)}`;
      const size = item.size ? ` | Size: ${item.size}` : "";
      return `${idx + 1}. ${item.category} - ${price}${size}`;
    });

    const message = [
      "UOOTD | Batch Request",
      ...lines,
      `Total Quoted (Fast Track items): $${formatUsd(totals.fastTrackTotal)}`,
      totals.vipCount ? `VIP Review Items: ${totals.vipCount}` : null,
      "Customer PayPal: <fill>",
      "Customer WhatsApp: <fill>",
    ]
      .filter(Boolean)
      .join("\n");

    const salesNumber = sanitizeNumber(SALES_WHATSAPP);
    return `https://wa.me/${salesNumber}?text=${encodeURIComponent(message)}`;
  }, [cart, totals.fastTrackTotal, totals.vipCount]);

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
            return (
              <div
                key={item.id}
                className="glass-card flex flex-wrap items-center gap-4 rounded-3xl p-4"
              >
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.16em] text-[#7b6848]">
                    {item.category}
                  </p>
                  <p className="text-lg font-semibold text-[var(--ink)]">
                    {quoteLabel(item.quoteUsd)}
                  </p>
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
            ${formatUsd(totals.fastTrackTotal)}
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
