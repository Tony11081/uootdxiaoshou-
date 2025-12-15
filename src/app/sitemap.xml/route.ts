import { NextResponse } from "next/server";

const SITE_URL = "https://newuootd.com";

const ROUTES = [
  { path: "/", changefreq: "daily", priority: 1 },
  { path: "/bags", changefreq: "weekly", priority: 0.7 },
  { path: "/golden-goose", changefreq: "weekly", priority: 0.7 },
  { path: "/uotd", changefreq: "weekly", priority: 0.5 },
  { path: "/offer", changefreq: "weekly", priority: 0.6 },
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/contact", changefreq: "monthly", priority: 0.5 },
  { path: "/faq", changefreq: "monthly", priority: 0.5 },
  { path: "/mission", changefreq: "monthly", priority: 0.4 },
  { path: "/privacy", changefreq: "yearly", priority: 0.2 },
  { path: "/terms", changefreq: "yearly", priority: 0.2 },
  { path: "/cart", changefreq: "weekly", priority: 0.3 },
] as const;

export const revalidate = 86400;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = ROUTES.map(({ path, changefreq, priority }) => {
    const loc = `${SITE_URL}${path === "/" ? "" : path}`;
    return [
      "<url>",
      `<loc>${escapeXml(loc)}</loc>`,
      `<lastmod>${lastmod}</lastmod>`,
      `<changefreq>${changefreq}</changefreq>`,
      `<priority>${priority.toFixed(1)}</priority>`,
      "</url>",
    ].join("");
  }).join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("");

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
