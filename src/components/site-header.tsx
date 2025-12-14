import Link from "next/link";

const navLinks = [
  { href: "/", label: "Upload" },
  { href: "/offer", label: "Offer" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(255,255,255,0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
            UOOTD
          </span>
          <span className="rounded-full bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#fef7d2]">
            Insider
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-semibold text-[#4f4635] sm:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="gold-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Sourcing List
          </Link>
        </div>
      </div>

      <div className="border-t border-black/5 bg-white/70 px-4 py-2 sm:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto text-xs font-semibold uppercase tracking-[0.14em] text-[#5c5345]">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
          <Link href="/cart" className="whitespace-nowrap hover:text-[var(--ink)]">
            List
          </Link>
        </div>
      </div>
    </header>
  );
}
