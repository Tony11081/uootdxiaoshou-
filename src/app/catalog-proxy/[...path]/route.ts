import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPSTREAM_ORIGIN = "https://www.wsxcme.com";

function isAllowedHost(hostname: string) {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.startsWith("catalog.")) return true;
  return false;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

function rewriteLocation(
  location: string,
  upstreamOrigin: string,
  requestOrigin: string,
) {
  try {
    const url = new URL(location, upstreamOrigin);
    if (url.origin === upstreamOrigin) {
      const reqUrl = new URL(requestOrigin);
      url.protocol = reqUrl.protocol;
      url.host = reqUrl.host;
    }
    return url.toString();
  } catch {
    return location;
  }
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0] ?? "";
  if (!isAllowedHost(hostname)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { path } = await context.params;

  const upstreamUrl = new URL(UPSTREAM_ORIGIN);
  upstreamUrl.pathname = `/${(path ?? []).join("/")}`;
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers();
  const setCookies = getSetCookieHeaders(upstreamRes.headers);
  upstreamRes.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") return;
    if (lower === "content-encoding") return;
    if (lower === "content-length") return;
    if (lower === "transfer-encoding") return;
    resHeaders.set(key, value);
  });

  for (const cookie of setCookies) {
    resHeaders.append("set-cookie", cookie);
  }

  const location = upstreamRes.headers.get("location");
  if (location) {
    resHeaders.set(
      "location",
      rewriteLocation(location, UPSTREAM_ORIGIN, request.nextUrl.origin),
    );
  }

  resHeaders.set("x-robots-tag", "noindex, nofollow");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: resHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

