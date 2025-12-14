import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import argon2 from "argon2";
import { authenticator } from "otplib";

const COOKIE_NAME = "uootd_auth";
const SESSION_TTL_SECONDS = 30 * 60; // 30 minutes

type UserSession = {
  email: string;
  role: "admin";
};

function getEnvOrThrow(key: string, fallback?: string) {
  const val = process.env[key] || fallback;
  if (!val) {
    throw new Error(`Missing required env: ${key}`);
  }
  return val;
}

const jwtSecret = () => new TextEncoder().encode(getEnvOrThrow("AUTH_JWT_SECRET"));

export async function verifyPassword(password: string) {
  const hash = getEnvOrThrow("ADMIN_PASSWORD_HASH");
  return argon2.verify(hash, password);
}

export function verifyTotp(token: string) {
  const secret = getEnvOrThrow("ADMIN_TOTP_SECRET");
  return authenticator.verify({ token, secret });
}

export function checkEmail(email: string) {
  const adminEmail = getEnvOrThrow("ADMIN_EMAIL");
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function createSession(user: UserSession) {
  const payload = {
    email: user.email,
    role: user.role,
  };
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(jwtSecret());

  cookies().set({
    name: COOKIE_NAME,
    value: jwt,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<UserSession | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "admin" };
  } catch {
    return null;
  }
}
