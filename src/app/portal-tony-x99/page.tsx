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
  channel?: "whatsapp" | "email" | "manual";
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
  imageUrl?: string;
};

const CATEGORY_OPTIONS = ["FOOTWEAR", "BAG", "ACCESSORY", "OTHER"] as const;
const STATUS_OPTIONS = ["FAST_TRACK", "VIP_REVIEW"] as const;

type ManualLeadDraft = {
  quoteId: string;
  category: (typeof CATEGORY_OPTIONS)[number];
  productName: string;
  detectedMsrpUsd: string;
  quoteUsd: string;
  status: (typeof STATUS_OPTIONS)[number];
  paypal: string;
  whatsapp: string;
  note: string;
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
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ManualLeadDraft>({
    quoteId: "",
    category: "BAG",
    productName: "",
    detectedMsrpUsd: "",
    quoteUsd: "",
    status: "FAST_TRACK",
    paypal: "",
    whatsapp: "",
    note: "",
  });

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

  const filteredLeads = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => {
      const haystack = [
        lead.id,
        lead.quoteId,
        lead.category,
        lead.productName,
        lead.status,
        lead.channel,
        lead.paypal,
        lead.whatsapp,
        lead.size,
        lead.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  })();

  const downloadText = (filename: string, contentType: string, text: string) => {
    const blob = new Blob([text], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const exportJson = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(
      `uootd-orders-${stamp}.json`,
      "application/json;charset=utf-8",
      JSON.stringify(filteredLeads, null, 2),
    );
  };

  const csvCell = (value: unknown) => {
    if (value === null || value === undefined) return "\"\"";
    const text = String(value).replace(/\"/g, "\"\"");
    return `"${text}"`;
  };

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const header = [
      "createdAt",
      "id",
      "quoteId",
      "channel",
      "category",
      "productName",
      "msrpUsd",
      "quoteUsd",
      "status",
      "paypal",
      "whatsapp",
      "size",
      "note",
      "imageUrl",
    ];

    const rows = filteredLeads.map((lead) => [
      lead.createdAt,
      lead.id,
      lead.quoteId || "",
      lead.channel || "",
      lead.category || "",
      lead.productName || "",
      typeof lead.detectedMsrpUsd === "number" ? lead.detectedMsrpUsd : "",
      typeof lead.quoteUsd === "number" ? lead.quoteUsd : lead.quoteUsd === null ? "VIP" : "",
      lead.status || "",
      lead.paypal,
      lead.whatsapp,
      lead.size || "",
      lead.note || "",
      lead.imageUrl || "",
    ]);

    const csv = [
      header.map(csvCell).join(","),
      ...rows.map((row) => row.map(csvCell).join(",")),
    ].join("\n");

    downloadText(
      `uootd-orders-${stamp}.csv`,
      "text/csv;charset=utf-8",
      `\ufeff${csv}`,
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record permanently?")) return;
    setError(null);
    setDeletingId(id);
    try {
      const lead = leads.find((row) => row.id === id);
      const quoteParam =
        lead?.quoteId ? `&quoteId=${encodeURIComponent(lead.quoteId)}` : "";
      const res = await fetch(`/api/leads?id=${encodeURIComponent(id)}${quoteParam}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Delete failed");
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const paypal = draft.paypal.trim();
    const whatsapp = draft.whatsapp.trim();
    if (!paypal || !whatsapp) {
      setError("PayPal and WhatsApp are required.");
      return;
    }

    let detectedMsrpUsd: number | undefined;
    const msrpRaw = draft.detectedMsrpUsd.trim();
    if (msrpRaw) {
      const parsed = Number(msrpRaw);
      if (!Number.isFinite(parsed)) {
        setError("MSRP must be a number.");
        return;
      }
      detectedMsrpUsd = parsed;
    }

    let quoteUsd: number | null | undefined;
    if (draft.status === "VIP_REVIEW") {
      quoteUsd = null;
    } else {
      const quoteRaw = draft.quoteUsd.trim();
      const parsed = Number(quoteRaw);
      if (!quoteRaw || !Number.isFinite(parsed)) {
        setError("Quote USD is required for FAST_TRACK.");
        return;
      }
      quoteUsd = parsed;
    }

    setSavingDraft(true);
    try {
      const payload = {
        channel: "manual",
        quoteId: draft.quoteId.trim() || undefined,
        category: draft.category,
        productName: draft.productName.trim() || undefined,
        detectedMsrpUsd,
        quoteUsd,
        status: draft.status,
        paypal,
        whatsapp,
        note: draft.note.trim() || undefined,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Unable to create record");
      }

      setAddOpen(false);
      await loadLeads();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create record";
      setError(message);
    } finally {
      setSavingDraft(false);
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
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 px-4 py-3 text-xs text-[#5c5345]">
              <div>
                <div className="font-semibold text-[var(--ink)]">
                  Orders captured from the checkout form
                  {storeSource ? ` (store: ${storeSource})` : ""}
                </div>
                <div className="text-[11px]">
                  Showing {filteredLeads.length} of {leads.length}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-44 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-[11px] shadow-inner focus:border-[#d4af37] focus:outline-none"
                  placeholder="Search orders..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setDraft({
                      quoteId: "",
                      category: "BAG",
                      productName: "",
                      detectedMsrpUsd: "",
                      quoteUsd: "",
                      status: "FAST_TRACK",
                      paypal: "",
                      whatsapp: "",
                      note: "",
                    });
                    setAddOpen(true);
                  }}
                  className="outline-button rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={!filteredLeads.length}
                  className="outline-button rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  disabled={!filteredLeads.length}
                  className="outline-button rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => void loadLeads()}
                  className="outline-button rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loadingLeads}
                >
                  {loadingLeads ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
            {error ? (
              <div className="bg-white/70 px-4 pb-3 text-sm font-semibold text-[#9a3b3b]">
                {error}
              </div>
            ) : null}
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
                {filteredLeads.length === 0 ? (
                  <tr className="bg-white/60">
                    <td className="px-3 py-3 text-sm text-[#5c5345]" colSpan={7}>
                      {loadingLeads
                        ? "Loading leads..."
                        : query.trim()
                          ? "No matches for your search."
                          : "No orders yet. Once a client submits the form, it will appear here."}
                    </td>
                  </tr>
                ) : null}
                {filteredLeads.map((lead, idx) => (
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
                      {typeof lead.detectedMsrpUsd === "number"
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
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        {lead.quoteId ? (
                          <a
                            className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                            href={`/api/assets/${encodeURIComponent(lead.quoteId)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Screenshot
                          </a>
                        ) : null}
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
                        <button
                          type="button"
                          className="outline-button rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a3b3b] disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => void handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                        >
                          {deletingId === lead.id ? "Deleting..." : "Delete"}
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

      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="glass-card w-full max-w-xl rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
                  Manual Entry
                </p>
                <p className="text-lg font-semibold text-[var(--ink)]">
                  Add an order record
                </p>
              </div>
              <button
                type="button"
                className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                onClick={() => setAddOpen(false)}
                disabled={savingDraft}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Quote ID (optional)
                  </label>
                  <input
                    value={draft.quoteId}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, quoteId: e.target.value }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                    placeholder="Q-1234"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Status
                  </label>
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        status: e.target.value as ManualLeadDraft["status"],
                        quoteUsd:
                          e.target.value === "VIP_REVIEW" ? "" : prev.quoteUsd,
                      }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Category
                  </label>
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        category: e.target.value as ManualLeadDraft["category"],
                      }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Quote USD
                  </label>
                  <input
                    value={draft.quoteUsd}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, quoteUsd: e.target.value }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none disabled:opacity-60"
                    placeholder={draft.status === "VIP_REVIEW" ? "VIP" : "245"}
                    inputMode="decimal"
                    disabled={draft.status === "VIP_REVIEW"}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    MSRP USD (optional)
                  </label>
                  <input
                    value={draft.detectedMsrpUsd}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        detectedMsrpUsd: e.target.value,
                      }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                    placeholder="980"
                    inputMode="decimal"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Product (optional)
                  </label>
                  <input
                    value={draft.productName}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                    placeholder="Brushed Hardware Tote"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={draft.paypal}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, paypal: e.target.value }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                    placeholder="customer@paypal.com"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    WhatsApp
                  </label>
                  <input
                    value={draft.whatsapp}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                    placeholder="+1 917 000 0000"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Note (optional)
                </label>
                <textarea
                  rows={3}
                  value={draft.note}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="resize-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-[#d4af37] focus:outline-none"
                  placeholder="Internal note..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="outline-button rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
                  onClick={() => setAddOpen(false)}
                  disabled={savingDraft}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={savingDraft}
                >
                  {savingDraft ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
