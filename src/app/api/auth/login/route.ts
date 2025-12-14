import { NextResponse } from "next/server";
import { checkEmail, createSession, verifyPassword, verifyTotp } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const totp = typeof body.totp === "string" ? body.totp : "";

    if (!email || !password || !totp) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    if (!checkEmail(email)) {
      console.warn(`Login failed (email mismatch) from ${ip}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const passwordOk = await verifyPassword(password);
    const totpOk = verifyTotp(totp);
    if (!passwordOk || !totpOk) {
      console.warn(`Login failed (auth) from ${ip}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({ email, role: "admin" });
    console.info(`Login success for ${email} from ${ip}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
