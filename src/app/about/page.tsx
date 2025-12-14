import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">About Us</h1>
        <p className="text-sm text-[#5c5345]">
          A private quoting &amp; confirmation desk built for discreet,
          high-intent buyers.
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          What We Do
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#4f4635]">
          <li>Turn screenshots into a private quote you can confirm fast.</li>
          <li>Coordinate size/color checks and availability on WhatsApp.</li>
          <li>Arrange QC and discreet packaging.</li>
          <li>Send PayPal invoices to the email you provide.</li>
        </ul>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b6848]">
          How It Works
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#4f4635]">
          <li>Upload a screenshot (full item + any visible hardware helps).</li>
          <li>Get an instant quote when available, or VIP review.</li>
          <li>Confirm details on WhatsApp.</li>
          <li>Receive a PayPal invoice and finalize privately.</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Get a quote
        </Link>
        <Link
          href="/contact"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}

