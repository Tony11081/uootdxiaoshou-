import type { Metadata } from "next";
import { CatalogClient } from "./catalog-client";

const SITE_URL = "https://newuootd.com";

export const metadata: Metadata = {
  title: "Product Catalog",
  description:
    "Browse the UOOTD product directory and contact us on WhatsApp for QC photos, availability, and PayPal invoice checkout.",
  alternates: {
    canonical: `${SITE_URL}/catalog`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CatalogPage() {
  return <CatalogClient />;
}

