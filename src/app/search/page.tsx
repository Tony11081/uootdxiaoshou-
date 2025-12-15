import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
  robots: {
    index: false,
    follow: true,
  },
};

type RouteCard = {
  href: string;
  title: string;
  keywords: string[];
  description: string;
};

const ROUTES: RouteCard[] = [
  {
    href: "/",
    title: "Upload & get a quote",
    keywords: ["upload", "quote", "uootd", "official", "oficial", "uuotd", "uotd"],
    description: "Upload a screenshot to request a private quote.",
  },
  {
    href: "/bags",
    title: "Bags",
    keywords: ["bag", "bags", "handbag", "tote", "crossbody"],
    description: "Bags sourcing and instant quote flow.",
  },
  {
    href: "/golden-goose",
    title: "Golden Goose",
    keywords: ["golden goose", "ggdb", "sneaker"],
    description: "Upload a Golden Goose screenshot to request a quote.",
  },
  {
    href: "/offer",
    title: "Offer",
    keywords: ["offer", "discount", "coupon"],
    description: "Limited-time session offer details.",
  },
  {
    href: "/faq",
    title: "FAQ",
    keywords: ["faq", "shipping", "paypal", "privacy"],
    description: "Shipping, privacy, and payment FAQs.",
  },
];

function normalizeQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(" ").trim().toLowerCase();
  return (value || "").trim().toLowerCase();
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] };
}) {
  const q = normalizeQuery(searchParams?.q);
  const results = q
    ? ROUTES.filter((route) => route.keywords.some((kw) => q.includes(kw)))
    : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
          UOOTD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Search</h1>
        <p className="text-sm text-[#5c5345]">
          {q ? (
            <>
              Results for <span className="font-mono">{q}</span>
            </>
          ) : (
            "Add ?q= in the URL to search."
          )}
        </p>
      </header>

      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/#upload"
            className="gold-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Upload a screenshot
          </Link>
          <Link
            href="/bags"
            className="outline-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Browse bags
          </Link>
        </div>
      </section>

      {q ? (
        results.length ? (
          <section className="grid gap-3 sm:grid-cols-2">
            {results.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="glass-card rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6848]">
                  {route.title}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {route.description}
                </p>
                <p className="mt-3 text-xs text-[#5c5345]">
                  Keywords: {route.keywords.slice(0, 6).join(", ")}
                </p>
              </Link>
            ))}
          </section>
        ) : (
          <section className="glass-card rounded-3xl p-6">
            <p className="text-sm text-[#4f4635]">
              No direct matches. Try <span className="font-mono">bags</span>,{" "}
              <span className="font-mono">golden goose</span>, or{" "}
              <span className="font-mono">uootd official site</span>.
            </p>
          </section>
        )
      ) : null}
    </div>
  );
}

