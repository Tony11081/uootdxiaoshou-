type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  windowSeconds: number;
  remaining: number;
  retryAfterSeconds: number | null;
  key: string;
  ip: string;
};

const DEFAULT_WINDOW_SECONDS = 300;
const DEFAULT_LIMIT = 10;

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const num = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(num)));
}

function normalizeEnv(value: string | undefined) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function normalizeUrl(value: string | undefined) {
  const normalized = normalizeEnv(value);
  if (!normalized) return undefined;
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return `https://${normalized}`;
}

function kvConfigured() {
  const kvUrl = normalizeUrl(process.env.KV_REST_API_URL);
  const kvToken = normalizeEnv(process.env.KV_REST_API_TOKEN);
  const upstashUrl = normalizeUrl(process.env.UPSTASH_REDIS_REST_URL);
  const upstashToken = normalizeEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  return Boolean((kvUrl && kvToken) || (upstashUrl && upstashToken));
}

async function getKv() {
  if (!kvConfigured()) return null;

  const url =
    normalizeUrl(process.env.KV_REST_API_URL) ||
    normalizeUrl(process.env.UPSTASH_REDIS_REST_URL);
  const token =
    normalizeEnv(process.env.KV_REST_API_TOKEN) ||
    normalizeEnv(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!url || !token) return null;
  process.env.KV_REST_API_URL = url;
  process.env.KV_REST_API_TOKEN = token;

  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

const memory = new Map<string, { count: number; resetAt: number }>();

function safeKeyPart(value: string) {
  return value.replace(/[^a-z0-9._:-]/gi, "_").slice(0, 120);
}

export function getRequestIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function checkQuoteRateLimit(request: Request): Promise<RateLimitDecision> {
  const windowSeconds = clampInt(
    process.env.QUOTE_RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS,
    30,
    3600,
  );
  const limit = clampInt(process.env.QUOTE_RATE_LIMIT_MAX, DEFAULT_LIMIT, 1, 200);

  const ip = getRequestIp(request);
  const key = `uootd:rl:quote:v1:${safeKeyPart(ip)}`;

  const kv = await getKv();
  if (kv) {
    try {
      const count = await kv.incr(key);
      if (count === 1) {
        await kv.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, limit - Number(count));
      if (Number(count) > limit) {
        const ttl = await kv.ttl(key).catch(() => null);
        const retryAfterSeconds =
          typeof ttl === "number" && ttl > 0 ? ttl : windowSeconds;
        return {
          allowed: false,
          limit,
          windowSeconds,
          remaining: 0,
          retryAfterSeconds,
          key,
          ip,
        };
      }

      return {
        allowed: true,
        limit,
        windowSeconds,
        remaining,
        retryAfterSeconds: null,
        key,
        ip,
      };
    } catch (err) {
      console.error("[rate-limit] KV failed, falling back to memory", err);
    }
  }

  const now = Date.now();
  const existing = memory.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    memory.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      windowSeconds,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: null,
      key,
      ip,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  if (existing.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      windowSeconds,
      remaining: 0,
      retryAfterSeconds,
      key,
      ip,
    };
  }

  return { allowed: true, limit, windowSeconds, remaining, retryAfterSeconds: null, key, ip };
}
