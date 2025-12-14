import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12 sm:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Privacy</h1>
        <p className="text-sm text-[#5c5345]">
          Private by default. We keep your quote flow discreet.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <ul className="list-disc space-y-2 pl-5 text-sm text-[#4f4635]">
          <li>Screenshots are used only to prepare your quote and are never posted.</li>
          <li>Contact details are used only to coordinate confirmation and invoicing.</li>
          <li>Screenshots and quote data are auto-deleted after 7 days.</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Back
        </Link>
        <Link
          href="/terms"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Terms
        </Link>
      </div>
    </div>
  );
}

