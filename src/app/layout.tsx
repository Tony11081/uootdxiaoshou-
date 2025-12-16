import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display, Sora } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

const SITE_URL = "https://newuootd.com";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UOOTD | Insider Quoting Desk",
    template: "%s | UOOTD",
  },
  description:
    "Upload a screenshot to request a private quote for luxury bags, shoes, and more. Worldwide shipping. PayPal invoice only.",
  keywords: [
    "UOOTD",
    "insider pricing",
    "luxury sourcing",
    "factory quote",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${playfair.variable} ${geistMono.variable} antialiased bg-[var(--paper)] text-[var(--ink)]`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1 pt-14">{children}</div>
          <FloatingWhatsApp />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
