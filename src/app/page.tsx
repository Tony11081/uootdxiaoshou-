import type { Metadata } from "next";
import HomeClient from "./home-client";

const SITE_URL = "https://newuootd.com";

export const metadata: Metadata = {
  title: {
    absolute: "UOOTD – Official Site | Upload Screenshot, Get Quote Instantly",
  },
  description:
    "Welcome to UOOTD, the official site. Upload a screenshot to get instant price quotes for fashion bags, shoes, and more. Worldwide shipping. PayPal invoice only.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

export default function HomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "UOOTD",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "UOOTD",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}

