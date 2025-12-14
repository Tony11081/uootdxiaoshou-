import Link from "next/link";
import { ContactInfo } from "@/components/contact-info";

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Contact Us</h1>
        <p className="text-sm text-[#5c5345]">
          Fastest channel is WhatsApp. Email is used for invoices.
        </p>
      </header>

      <ContactInfo />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          Home
        </Link>
        <Link
          href="/faq"
          className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
        >
          FAQ
        </Link>
      </div>
    </div>
  );
}

