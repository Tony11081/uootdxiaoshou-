import fs from "fs/promises";
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
  paypal: string;
  whatsapp: string;
  size?: string;
  note?: string;
  imageUrl?: string;
  sourceIp?: string;
};

type LeadInput = Omit<LeadRecord, "id" | "createdAt">;

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const MAX_STORED = 400;

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, "[]", "utf8");
  }
}

async function readLeads(): Promise<LeadRecord[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
}

async function writeLeads(leads: LeadRecord[]) {
  await ensureStore();
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
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
  const leads = await readLeads();
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
    paypal: safeString(input.paypal) || "",
    whatsapp: safeString(input.whatsapp) || "",
    size: safeString(input.size),
    note: safeString(input.note),
    imageUrl: safeString(input.imageUrl),
    sourceIp: safeString(input.sourceIp),
  };

  const next = [record, ...leads].slice(0, MAX_STORED);
  await writeLeads(next);
  return record;
}

export async function listLeads() {
  const leads = await readLeads();
  return leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
