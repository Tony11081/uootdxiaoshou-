"use client";

import type { Quote } from "@/types/quote";

export const STORAGE_CART_KEY = "uootd_cart_v1";
export const AUTO_DELETE_DAYS = 7;

export type CartItem = Quote & { size?: string; addedAt?: number };

const DAY_MS = 24 * 60 * 60 * 1000;

function safeRead(storage: Storage | undefined | null) {
  try {
    return storage?.getItem(STORAGE_CART_KEY) ?? null;
  } catch {
    return null;
  }
}

function safeWrite(storage: Storage | undefined | null, payload: string) {
  try {
    storage?.setItem(STORAGE_CART_KEY, payload);
    return true;
  } catch {
    return false;
  }
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const now = Date.now();
  const raw =
    safeRead(window.localStorage) ??
    safeRead(window.sessionStorage);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return (parsed as CartItem[])
      .map((item) => ({
        ...item,
        addedAt: typeof item.addedAt === "number" ? item.addedAt : now,
      }))
      .filter((item) => now - (item.addedAt ?? now) <= AUTO_DELETE_DAYS * DAY_MS);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return false;
  const payload = JSON.stringify(items);
  const wroteLocal = safeWrite(window.localStorage, payload);
  const wroteSession = safeWrite(window.sessionStorage, payload);
  return wroteLocal || wroteSession;
}
