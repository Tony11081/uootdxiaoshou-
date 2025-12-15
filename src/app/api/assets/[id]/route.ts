import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth";
import { getQuoteAsset } from "@/server/assets-store";

export const dynamic = "force-dynamic";

function parseDataUrl(value: string) {
  if (!value.startsWith("data:")) return null;
  const match = value.match(/^data:(.+);base64,(.*)$/);
  if (!match) return null;
  const [, mimeType, data] = match;
  return { mimeType, data };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: quoteId } = await context.params;
  if (!quoteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const record = await getQuoteAsset(quoteId);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dataUrl = parseDataUrl(record.imageUrl);
  if (dataUrl) {
    const buffer = Buffer.from(dataUrl.data, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": dataUrl.mimeType,
        "Cache-Control": "no-store, private",
      },
    });
  }

  try {
    const url = new URL(record.imageUrl, request.url);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }
}
