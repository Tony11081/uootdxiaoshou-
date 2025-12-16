import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/bags", label: "Bags" },
  { href: "/golden-goose", label: "Golden Goose" },
  { href: "/uotd", label: "UOTD / UOOTD" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/mission", label: "Our Mission" },
  { href: "/cart", label: "Sourcing List" },
  { href: "/sitemap.xml", label: "Sitemap (XML)" },
] as const;

export default function SitemapPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Sitemap</h1>
        <p className="text-sm text-[#5c5345]">Quick navigation.</p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <ul className="grid gap-3 text-sm text-[#4f4635] sm:grid-cols-2">
          {links.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-[var(--ink)]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
