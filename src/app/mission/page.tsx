import Link from "next/link";

export default function MissionPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Our Mission</h1>
        <p className="text-sm text-[#5c5345]">
          Make private sourcing feel effortless, discreet, and fast.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          The Standard
        </h2>
        <p className="mt-4 text-sm text-[#4f4635]">
          UOOTD is built around a simple promise: you should be able to go from a
          screenshot to a confirmed invoice without public posts, unnecessary
          accounts, or endless back-and-forth.
        </p>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          Principles
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#4f4635]">
          <li>Discretion first: private by default, minimal data.</li>
          <li>Speed with clarity: quick quotes and clear confirmation steps.</li>
          <li>Quality mindset: QC + careful packaging for peace of mind.</li>
          <li>Respect: no spam, no pressure, no account required.</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Start a quote
        </Link>
        <Link
          href="/privacy"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
}

