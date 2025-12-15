"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type LeadRow = {
  id: string;
  createdAt: string;
  quoteId?: string;
  category?: string;
  productName?: string;
  detectedMsrpUsd?: number | null;
  quoteUsd?: number | null;
  status?: string;
  channel?: "whatsapp" | "email";
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
  imageUrl?: string;
};

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function AdminPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [storeSource, setStoreSource] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    void loadLeads();
  }, [loggedIn]);

  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to load leads");
      }
      const data = await res.json();
      if (Array.isArray(data?.leads)) {
        setLeads(data.leads);
      } else {
        setLeads([]);
      }
      setStoreSource(typeof data?.source === "string" ? data.source : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load leads";
      setError(message);
    } finally {
      setLoadingLeads(false);
    }
  };

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
        void loadLeads();
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
              placeholder="Strong admin password"
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
          <div className="flex items-center justify-between bg-white/70 px-4 py-2 text-xs text-[#5c5345]">
              <span>
                Live leads submitted from the upload flow.
                {storeSource ? ` (store: ${storeSource})` : ""}
              </span>
              <div className="flex items-center gap-2">
                {loadingLeads ? <span>Refreshing…</span> : null}
                <button
                  type="button"
                  onClick={() => void loadLeads()}
                  className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                  disabled={loadingLeads}
                >
                  Refresh
                </button>
              </div>
            </div>
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-black text-[#fef7d2]">
                <tr>
                  <th className="px-3 py-2 text-left">Quote</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">MSRP</th>
                  <th className="px-3 py-2 text-left">Quote</th>
                  <th className="px-3 py-2 text-left">Contact</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr className="bg-white/60">
                    <td className="px-3 py-3 text-sm text-[#5c5345]" colSpan={7}>
                      {loadingLeads
                        ? "Loading leads..."
                        : "No live leads yet. Once a client submits the form, it will appear here."}
                    </td>
                  </tr>
                ) : null}
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={idx % 2 ? "bg-white/70" : "bg-white/50"}
                  >
                    <td className="px-3 py-2 font-semibold text-[var(--ink)]">
                      {lead.quoteId || lead.id}
                      <div className="text-[11px] font-normal text-[#5c5345]">
                        {new Date(lead.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">
                      <div className="font-semibold text-[var(--ink)]">
                        {lead.category || "—"}
                      </div>
                      <div className="text-[11px]">{lead.productName || lead.status || "—"}</div>
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">
                      {lead.detectedMsrpUsd
                        ? `$${formatUsd(lead.detectedMsrpUsd)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-[var(--ink)]">
                      {typeof lead.quoteUsd === "number"
                        ? `$${formatUsd(lead.quoteUsd)}`
                        : lead.quoteUsd === null
                        ? "VIP review"
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">
                      <div>{lead.paypal}</div>
                      <div className="text-[11px]">{lead.whatsapp}</div>
                      {lead.channel ? (
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                          via {lead.channel}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-[#5c5345]">
                      {lead.size ? <div>Size: {lead.size}</div> : null}
                      {lead.note ? <div className="text-[11px]">{lead.note}</div> : null}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                          onClick={() => copyValue(lead.paypal)}
                        >
                          Copy PayPal
                        </button>
                        <a
                          className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                          href={`https://wa.me/${lead.whatsapp.replace(/[^\d+]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        {lead.imageUrl ? (
                          <a
                            className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                            href={lead.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Image
                          </a>
                        ) : null}
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
