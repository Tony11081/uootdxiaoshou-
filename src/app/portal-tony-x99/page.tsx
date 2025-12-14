"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type AdminQuote = {
  id: string;
  category: string;
  msrpUsd: number;
  insiderPrice: number;
  paypal: string;
  whatsapp: string;
};

const adminQuotes: AdminQuote[] = [
  {
    id: "Q-5941",
    category: "FOOTWEAR",
    msrpUsd: 780,
    insiderPrice: 195,
    paypal: "vipbuyer@example.com",
    whatsapp: "+19170000000",
  },
  {
    id: "Q-4220",
    category: "BAG",
    msrpUsd: 980,
    insiderPrice: 245,
    paypal: "baglover@example.com",
    whatsapp: "+351900000000",
  },
];

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function AdminPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, totp: otp }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Login failed");
        }
        setLoggedIn(true);
      })
      .catch((err) => setError(err.message));
  };

  const copyValue = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-12 sm:px-8 lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
          Hidden Path: /portal-tony-x99
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">
          Admin Workbench
        </h1>
        <p className="text-sm text-[#5c5345]">
          URL is non-obvious, locked behind password + TOTP. Place Cloudflare
          WAF in front for anti-scan.
        </p>
      </div>

      {!loggedIn ? (
          <form
            onSubmit={handleLogin}
            className="glass-card grid gap-3 rounded-3xl p-6 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
              Dual Factor Login
            </p>
            <p className="text-sm text-[#4f4635]">
              Enter admin password + 6-digit TOTP (Google Authenticator).
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
              placeholder="admin@uootd.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[var(--ink)]">
              6-digit TOTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
              placeholder="123 456"
              required
            />
          </div>
          {error ? (
            <p className="text-sm font-semibold text-[#9a3b3b] sm:col-span-2">{error}</p>
          ) : null}
          <div className="self-end">
            <button
              type="submit"
              className="gold-button rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Enter Portal
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
              Sales Workbench
            </p>
            <Link
              href="/"
              className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              Back to Upload
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-black text-[#fef7d2]">
                <tr>
                  <th className="px-3 py-2 text-left">Quote</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">MSRP</th>
                  <th className="px-3 py-2 text-left">Insider</th>
                  <th className="px-3 py-2 text-left">PayPal</th>
                  <th className="px-3 py-2 text-left">WhatsApp</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminQuotes.map((q, idx) => (
                  <tr
                    key={q.id}
                    className={idx % 2 ? "bg-white/70" : "bg-white/50"}
                  >
                    <td className="px-3 py-2 font-semibold text-[var(--ink)]">
                      {q.id}
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">{q.category}</td>
                    <td className="px-3 py-2 text-[#5c5345]">
                      ${formatUsd(q.msrpUsd)}
                    </td>
                    <td className="px-3 py-2 text-[var(--ink)]">
                      ${formatUsd(q.insiderPrice)}
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">{q.paypal}</td>
                    <td className="px-3 py-2 text-[#5c5345]">{q.whatsapp}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                          onClick={() => copyValue(q.paypal)}
                        >
                          Copy PayPal
                        </button>
                        <a
                          className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                          href={`https://wa.me/${q.whatsapp.replace(/[^\d+]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        <button className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                          Edit Price
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#5c5345]">
            Add rate limiting + audit logging here. For production, serve behind
            Cloudflare and enforce HSTS + CSP.
          </p>
        </div>
      )}
    </div>
  );
}
