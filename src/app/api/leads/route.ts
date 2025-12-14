import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  return NextResponse.json({
    status: "captured",
    received: payload,
    at: new Date().toISOString(),
  });
}
