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
  status?: string;
  channel?: "whatsapp" | "email";
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

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  if (!kvConfigured()) return null;
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
    status: safeString(input.status),
    channel: input.channel === "whatsapp" || input.channel === "email" ? input.channel : undefined,
    paypal: safeString(input.paypal) || "",
    whatsapp: safeString(input.whatsapp) || "",
    size: safeString(input.size),
    note: safeString(input.note),
    imageUrl: safeString(input.imageUrl),
    sourceIp: safeString(input.sourceIp),
  };

  const kv = await getKv();
  if (kv) {
    await kv.lpush(KV_KEY, JSON.stringify(record));
    await kv.ltrim(KV_KEY, 0, MAX_STORED - 1);
    return record;
  }

  const leads = await readFsLeads();
  const next = [record, ...leads].slice(0, MAX_STORED);
  await writeFsLeads(next);
  return record;
}

export async function listLeads() {
  const kv = await getKv();
  if (kv) {
    const rows = await kv.lrange(KV_KEY, 0, MAX_STORED - 1);
    const parsed = rows
      .map((row) => {
        try {
          if (typeof row === "string") return JSON.parse(row);
          if (row && typeof row === "object") return row;
        } catch {}
        return null;
      })
      .filter(Boolean) as LeadRecord[];

    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const leads = await readFsLeads();
  return leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
