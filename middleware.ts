import { NextResponse, type NextRequest } from "next/server";

const STORE_PATH = "/weshop/store/A202005261219019980372630";

function isCatalogHost(hostname: string) {
  return hostname === "catalog.newuootd.com" || hostname.startsWith("catalog.");
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0] ?? "";

  if (!isCatalogHost(hostname)) return NextResponse.next();

  const url = request.nextUrl.clone();

  if (url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  if (url.pathname === "/sitemap.xml") {
    return new Response("", { status: 404 });
  }

  if (url.pathname === "/") {
    url.pathname = `/catalog-proxy${STORE_PATH}`;
    return NextResponse.rewrite(url);
  }

  if (url.pathname.startsWith("/catalog-proxy/")) return NextResponse.next();

  url.pathname = `/catalog-proxy${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
