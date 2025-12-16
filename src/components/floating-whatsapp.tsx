import { CONTACT } from "@/components/contact-info";

type FloatingWhatsAppProps = {
  message?: string;
};

const DEFAULT_MESSAGE =
  "Need QC photos first? Chat with us and we'll share real photos/videos, confirm availability, then send a PayPal invoice.";

export function FloatingWhatsApp({ message = DEFAULT_MESSAGE }: FloatingWhatsAppProps) {
  const href = `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-24 sm:right-6">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-full border border-black/10 bg-[rgba(17,17,17,0.88)] px-3 py-2 shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:bg-black"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md">
          <svg
            viewBox="0 0 32 32"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19.11 17.55c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.33-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.56.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.71.34-.25.27-.93.91-.93 2.22 0 1.3.95 2.56 1.08 2.74.14.18 1.87 2.86 4.54 4.01.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.6-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
            <path d="M16.04 3.2c-6.95 0-12.6 5.65-12.6 12.6 0 2.22.58 4.39 1.68 6.3L3.2 28.8l6.87-1.8c1.85 1.01 3.94 1.54 6.08 1.54 6.95 0 12.6-5.65 12.6-12.6s-5.65-12.6-12.7-12.6zm0 22.12c-1.97 0-3.9-.53-5.6-1.54l-.4-.23-4.08 1.07 1.08-3.98-.26-.41c-1.04-1.67-1.59-3.6-1.59-5.58 0-5.8 4.72-10.52 10.52-10.52 5.8 0 10.52 4.72 10.52 10.52s-4.72 10.67-10.2 10.67z" />
          </svg>
        </span>
        <div className="hidden sm:block pr-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fef7d2]">
            Need QC photos first?
          </p>
          <p className="text-xs text-[#f3e5b8]/90">Chat on WhatsApp</p>
        </div>
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </div>
  );
}

