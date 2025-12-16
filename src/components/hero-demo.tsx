"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DemoStep = {
  key: string;
  label: string;
  title: string;
  body: string;
};

const STEPS: DemoStep[] = [
  {
    key: "upload",
    label: "01",
    title: "Upload",
    body: "Tap once to upload a screenshot (private, auto-deleted).",
  },
  {
    key: "quote",
    label: "02",
    title: "Quote",
    body: "Get Premium + Normal quotes with PayPal Buyer Protection.",
  },
  {
    key: "qc",
    label: "03",
    title: "QC",
    body: "Receive QC photos within 24h. We ship only after approval.",
  },
  {
    key: "ship",
    label: "04",
    title: "Ship",
    body: "Worldwide free shipping (US/EU 7–12 business days).",
  },
];

function DemoScreen({ step }: { step: number }) {
  const safeStep = Math.max(0, Math.min(STEPS.length - 1, step));
  const active = STEPS[safeStep];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/8 bg-gradient-to-br from-white/90 to-[#f5efe2] p-5 shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0b06]/12 via-transparent to-[#b39748]/10" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
            Live demo
          </p>
          <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
            {active.title}
          </span>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white/80 p-4 shadow-sm">
          {active.key === "upload" ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="text-[#7b6848]"
                >
                  <path d="M14 3h5v5" />
                  <path d="M10 14 21 3" />
                  <path d="M21 14v7H3V3h7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--ink)]">Screenshot.jpg</p>
                <p className="text-xs text-[#5c5345]">Private quote request</p>
              </div>
              <span className="rounded-full border border-black/10 bg-[#f9f4e2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7b6848]">
                Choose
              </span>
            </div>
          ) : null}

          {active.key === "quote" ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                  Premium / Normal
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--ink)]">$245 / $159</p>
                <p className="mt-1 text-xs text-[#5c5345]">PayPal Buyer Protection · no prepayment</p>
              </div>
              <div className="scanner-dot" aria-hidden="true" />
            </div>
          ) : null}

          {active.key === "qc" ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6848]">
                QC set
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-white to-black/5" />
                    <div className="absolute inset-x-2 bottom-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7b6848]">
                      Photo {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {active.key === "ship" ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="text-[#7b6848]"
                >
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                  <path d="M19 5 5 19" />
                  <path d="M5 5l14 14" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--ink)]">Worldwide free shipping</p>
                <p className="text-xs text-[#5c5345]">US & Europe: 7–12 business days</p>
              </div>
              <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                Discreet
              </span>
            </div>
          ) : null}
        </div>

        <div className="scanner-rail h-2 rounded-full bg-black/5" aria-hidden="true" />
        <p className="text-xs text-[#5c5345]">{active.body}</p>
      </div>
    </div>
  );
}

export function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const progress = useMemo(() => {
    return STEPS.map((s, idx) => ({
      ...s,
      active: idx === step,
    }));
  }, [step]);

  return (
    <section className="glass-card rounded-3xl border border-black/8 bg-white/90 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
            See it → Quote it → QC → Ship
          </p>
          <p className="mt-1 text-sm text-[#4f4635]">
            A quick walkthrough of our private quoting flow.
          </p>
        </div>
        <Link
          href="/#upload"
          className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Try it now
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <DemoScreen step={step} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {progress.map((s) => (
            <div
              key={s.key}
              className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                s.active
                  ? "border-[#d4af37]/60 bg-[#f9f4e2]/70"
                  : "border-black/8 bg-white/80"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
                {s.label} · {s.title}
              </p>
              <p className="mt-1 text-xs text-[#4f4635]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

