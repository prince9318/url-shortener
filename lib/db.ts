// lib/db.ts
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  // Surface a clear warning in development when DB is not configured
  console.warn("DATABASE_URL is not set. API endpoints will fail until configured.");
}

// Always return an array of rows, normalizing Neon responses
type Row = Record<string, any>;
type TemplateTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<Row[]>;

export const db: TemplateTag = url
  ? (async (strings: TemplateStringsArray, ...values: any[]): Promise<Row[]> => {
      const sql = neon(url) as any;
      const res = await sql(strings, ...values);
      // Neon may return an array directly or an object with .rows
      if (Array.isArray(res)) return res as Row[];
      if (res && typeof res === "object" && "rows" in res) return (res.rows as Row[]) ?? [];
      return [];
    })
  : (async () => {
      throw new Error("DATABASE_URL is missing. Set it in .env.local to use the API.");
    }) as TemplateTag;

// Ensure DB schema exists (idempotent)
let schemaReady: Promise<void> | null = null;
export async function ensureSchema(): Promise<void> {
  if (!url) throw new Error("DATABASE_URL is missing. Set it in .env.local to use the API.");
  if (!schemaReady) {
    schemaReady = (async () => {
      await db`
        CREATE TABLE IF NOT EXISTS links (
          code TEXT PRIMARY KEY,
          target_url TEXT NOT NULL,
          clicks INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_clicked TIMESTAMPTZ
        )
      `;
    })();
  }
  return schemaReady;
}
