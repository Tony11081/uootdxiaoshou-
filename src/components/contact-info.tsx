import type { Locale } from "@/types/quote";

type ContactInfoProps = {
  embedded?: boolean;
  locale?: Locale;
};

export const CONTACT = {
  whatsappDisplay: "+86 134 6224 8923",
  whatsappDigits: "8613462248923",
  email: "Tony@uootd.net",
  textDisplay: "+01 508 322 1340",
  textDigits: "+15083221340",
  hours: "Monday to Friday: 9AM - 7PM EST\nSaturday: 10AM - 5PM EST",
} as const;

const slaLine: Record<Locale, string> = {
  en: "Replies in ~10 minutes during business hours.",
  pt: "Responde em ~10 minutos no horario comercial.",
  es: "Responde en ~10 minutos en horario laboral.",
};

export function ContactInfo({ embedded = false, locale = "en" }: ContactInfoProps) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-[0.2em] text-[#7b6848]">
        Contact
      </p>

      <div className="mt-3 grid gap-3 text-sm text-[var(--ink)]">
        <a
          href={`https://wa.me/${CONTACT.whatsappDigits}`}
          target="_blank"
          rel="noreferrer"
          className="gold-button flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
        >
          <span>WhatsApp</span>
          <span className="font-mono text-sm normal-case tracking-normal">
            {CONTACT.whatsappDisplay}
          </span>
        </a>

        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={`mailto:${CONTACT.email}`}
            className="rounded-2xl border border-black/8 bg-white/80 px-4 py-3 shadow-sm hover:bg-white"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-[#7b6848]">
              Email
            </p>
            <p className="font-semibold">{CONTACT.email}</p>
          </a>

          <a
            href={`tel:${CONTACT.textDigits}`}
            className="rounded-2xl border border-black/8 bg-white/80 px-4 py-3 shadow-sm hover:bg-white"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-[#7b6848]">
              Text
            </p>
            <p className="font-semibold">{CONTACT.textDisplay}</p>
          </a>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white/80 px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#7b6848]">
            Hours (EST)
          </p>
          <p className="whitespace-pre-line font-semibold">{CONTACT.hours}</p>
          <p className="mt-2 text-xs text-[#5c5345]">{slaLine[locale]}</p>
        </div>
      </div>
    </>
  );

  if (embedded) return content;

  return <div className="glass-card rounded-3xl p-5">{content}</div>;
}
