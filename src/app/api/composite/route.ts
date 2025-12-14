import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const imageUrl = payload?.imageUrl;

  return NextResponse.json({
    compositeUrl: imageUrl,
    overlay: "vignette+gold-type (mocked)",
  });
}
