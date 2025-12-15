import fs from "fs/promises";
import os from "os";
import path from "path";

export type LeadRecord = {
  id: string;
  createdAt: string;
  quoteId?: string;
  category?: string;
  productName?: string;
  detectedMsrpUsd?: number | null;
  quoteUsd?: number | null;
  normalQuoteUsd?: number | null;
  selectedTier?: "premium" | "normal";
  selectedQuoteUsd?: number | null;
  status?: string;
  channel?: "whatsapp" | "email" | "manual";
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
  imageUrl?: string;
  sourceIp?: string;
};

type LeadInput = Omit<LeadRecord, "id" | "createdAt">;

const MAX_STORED = 400;
const KV_KEY = "uootd:leads:v1";
const FS_PRIMARY_DIR = path.join(process.cwd(), "data");
const FS_FALLBACK_DIR = path.join(os.tmpdir(), "uootd");

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

let resolvedFsFile: string | null = null;

async function resolveFsFile() {
  if (resolvedFsFile !== null) return resolvedFsFile;

  const tryDir = async (dir: string) => {
    await fs.mkdir(dir, { recursive: true });
    return path.join(dir, "leads.json");
  };

  try {
    resolvedFsFile = await tryDir(FS_PRIMARY_DIR);
    return resolvedFsFile;
  } catch {}

  try {
    resolvedFsFile = await tryDir(FS_FALLBACK_DIR);
    return resolvedFsFile;
  } catch {}

  resolvedFsFile = null;
  return null;
}

async function readFsLeads(): Promise<LeadRecord[]> {
  const file = await resolveFsFile();
  if (!file) return [];
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
}

async function writeFsLeads(leads: LeadRecord[]) {
  const file = await resolveFsFile();
  if (!file) return;
  try {
    await fs.writeFile(file, JSON.stringify(leads, null, 2), "utf8");
  } catch {}
}

function safeString(input: unknown) {
  return typeof input === "string" ? input.trim() : undefined;
}

function safeNumber(input: unknown) {
  const num = typeof input === "number" ? input : Number(input);
  return Number.isFinite(num) ? num : null;
}

function parseLeadRow(row: unknown): LeadRecord | null {
  try {
    if (typeof row === "string") return JSON.parse(row) as LeadRecord;
    if (row && typeof row === "object") return row as LeadRecord;
  } catch {}
  return null;
}

export async function addLead(input: LeadInput) {
  const now = new Date().toISOString();
  const record: LeadRecord = {
    id: `L-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)
      .toString()
      .padStart(4, "0")}`,
    createdAt: now,
    quoteId: safeString(input.quoteId),
    category: safeString(input.category),
    productName: safeString(input.productName),
    detectedMsrpUsd: safeNumber(input.detectedMsrpUsd),
    quoteUsd:
      input.quoteUsd === null ? null : safeNumber(input.quoteUsd ?? undefined),
    normalQuoteUsd:
      input.normalQuoteUsd === null
        ? null
        : safeNumber(input.normalQuoteUsd ?? undefined),
    selectedTier:
      input.selectedTier === "premium" || input.selectedTier === "normal"
        ? input.selectedTier
        : undefined,
    selectedQuoteUsd:
      input.selectedQuoteUsd === null
        ? null
        : safeNumber(input.selectedQuoteUsd ?? undefined),
    status: safeString(input.status),
    channel:
      input.channel === "whatsapp" ||
      input.channel === "email" ||
      input.channel === "manual"
        ? input.channel
        : undefined,
    paypal: safeString(input.paypal) || "",
    whatsapp: safeString(input.whatsapp) || "",
    size: safeString(input.size),
    note: safeString(input.note),
    imageUrl: safeString(input.imageUrl),
    sourceIp: safeString(input.sourceIp),
  };

  const kv = await getKv();
  if (kv) {
    try {
      await kv.lpush(KV_KEY, JSON.stringify(record));
      await kv.ltrim(KV_KEY, 0, MAX_STORED - 1);
      return record;
    } catch (err) {
      console.error("[leads] KV write failed, falling back to FS", err);
    }
  }

  const leads = await readFsLeads();
  const next = [record, ...leads].slice(0, MAX_STORED);
  await writeFsLeads(next);
  return record;
}

export async function listLeadsWithSource() {
  const kv = await getKv();
  if (kv) {
    try {
      const rows = await kv.lrange(KV_KEY, 0, MAX_STORED - 1);
      const parsed = rows.map(parseLeadRow).filter(Boolean) as LeadRecord[];

      const leads = parsed.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { leads, source: "kv" as const };
    } catch (err) {
      console.error("[leads] KV read failed, falling back to FS", err);
    }
  }

  const leads = await readFsLeads();
  return {
    leads: leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    source: "fs" as const,
  };
}

export async function listLeads() {
  const { leads } = await listLeadsWithSource();
  return leads;
}

export async function deleteLead(id: string) {
  const kv = await getKv();
  if (kv) {
    try {
      const rows = await kv.lrange(KV_KEY, 0, MAX_STORED - 1);
      const parsed = rows.map(parseLeadRow).filter(Boolean) as LeadRecord[];
      const filtered = parsed.filter((lead) => lead.id !== id);
      if (filtered.length === parsed.length) return false;
      await kv.del(KV_KEY);
      if (filtered.length) {
        await kv.rpush(
          KV_KEY,
          ...filtered.map((lead) => JSON.stringify(lead))
        );
      }
      return true;
    } catch (err) {
      console.error("[leads] KV delete failed, falling back to FS", err);
    }
  }

  const leads = await readFsLeads();
  const filtered = leads.filter((lead) => lead.id !== id);
  if (filtered.length === leads.length) return false;
  await writeFsLeads(filtered);
  return true;
}
