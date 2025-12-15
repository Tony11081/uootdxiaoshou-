import fs from "fs/promises";
import os from "os";
import path from "path";

export type QuoteAssetRecord = {
  quoteId: string;
  createdAt: string;
  imageUrl: string;
};

const TTL_SECONDS = 7 * 24 * 60 * 60;
const KV_PREFIX = "uootd:asset:v1:";
const FS_PRIMARY_DIR = path.join(process.cwd(), "data", "assets");
const FS_FALLBACK_DIR = path.join(os.tmpdir(), "uootd", "assets");

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

let resolvedFsDir: string | null = null;

async function resolveFsDir() {
  if (resolvedFsDir !== null) return resolvedFsDir;

  const tryDir = async (dir: string) => {
    await fs.mkdir(dir, { recursive: true });
    return dir;
  };

  try {
    resolvedFsDir = await tryDir(FS_PRIMARY_DIR);
    return resolvedFsDir;
  } catch {}

  try {
    resolvedFsDir = await tryDir(FS_FALLBACK_DIR);
    return resolvedFsDir;
  } catch {}

  resolvedFsDir = null;
  return null;
}

function safeFilename(input: string) {
  return input.replace(/[^a-z0-9_-]/gi, "_");
}

function kvKey(quoteId: string) {
  return `${KV_PREFIX}${quoteId}`;
}

export async function putQuoteAsset(quoteId: string, imageUrl: string) {
  if (!quoteId || !imageUrl) return { ok: false, source: "none" as const };

  const record: QuoteAssetRecord = {
    quoteId,
    createdAt: new Date().toISOString(),
    imageUrl,
  };

  const kv = await getKv();
  if (kv) {
    try {
      await kv.set(kvKey(quoteId), JSON.stringify(record), { ex: TTL_SECONDS });
      return { ok: true, source: "kv" as const };
    } catch (err) {
      console.error("[assets] KV write failed, falling back to FS", err);
    }
  }

  const dir = await resolveFsDir();
  if (!dir) return { ok: false, source: "none" as const };
  const file = path.join(dir, `${safeFilename(quoteId)}.json`);
  try {
    await fs.writeFile(file, JSON.stringify(record, null, 2), "utf8");
    return { ok: true, source: "fs" as const };
  } catch {
    return { ok: false, source: "none" as const };
  }
}

export async function getQuoteAsset(
  quoteId: string,
): Promise<QuoteAssetRecord | null> {
  if (!quoteId) return null;

  const kv = await getKv();
  if (kv) {
    try {
      const raw = await kv.get(kvKey(quoteId));
      if (typeof raw === "string") return JSON.parse(raw) as QuoteAssetRecord;
      if (raw && typeof raw === "object") return raw as QuoteAssetRecord;
    } catch (err) {
      console.error("[assets] KV read failed, falling back to FS", err);
    }
  }

  const dir = await resolveFsDir();
  if (!dir) return null;
  const file = path.join(dir, `${safeFilename(quoteId)}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as QuoteAssetRecord;
  } catch {
    return null;
  }
}

export async function deleteQuoteAsset(quoteId: string) {
  if (!quoteId) return false;

  const kv = await getKv();
  if (kv) {
    try {
      await kv.del(kvKey(quoteId));
      return true;
    } catch (err) {
      console.error("[assets] KV delete failed, falling back to FS", err);
    }
  }

  const dir = await resolveFsDir();
  if (!dir) return false;
  const file = path.join(dir, `${safeFilename(quoteId)}.json`);
  try {
    await fs.unlink(file);
    return true;
  } catch {
    return false;
  }
}

