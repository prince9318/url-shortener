// lib/db.ts
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  // Surface a clear warning in development when DB is not configured
  console.warn(
    "DATABASE_URL is not set. API endpoints will fail until configured."
  );
}

// Always return an array of rows, normalizing Neon responses
type Row = Record<string, any>;
type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<Row[]>;

export const db: TemplateTag = url
  ? async (strings: TemplateStringsArray, ...values: any[]): Promise<Row[]> => {
      const sql = neon(url) as any;
      const res = await sql(strings, ...values);
      // Neon may return an array directly or an object with .rows
      if (Array.isArray(res)) return res as Row[];
      if (res && typeof res === "object" && "rows" in res)
        return (res.rows as Row[]) ?? [];
      return [];
    }
  : ((): TemplateTag => {
      // Development in-memory fallback so the UI and API remain usable
      // when `DATABASE_URL` is not configured. This avoids 503s while
      // developing the frontend. In production we expect a real DB.
      if (process.env.NODE_ENV !== "development") {
        return (async () => {
          throw new Error(
            "DATABASE_URL is missing. Set it in .env to use the API."
          );
        }) as TemplateTag;
      }

      const store: Row[] = [];

      const tag: TemplateTag = async (
        strings: TemplateStringsArray,
        ...values: any[]
      ) => {
        const sql = strings.join("${}").trim().toUpperCase();

        // SELECT all links
        if (sql.startsWith("SELECT * FROM LINKS") && !/WHERE/.test(sql)) {
          return store
            .slice()
            .sort((a, b) =>
              (b.created_at || "") > (a.created_at || "") ? 1 : -1
            );
        }

        // SELECT by target_url
        if (/SELECT \* FROM LINKS WHERE TARGET_URL/.test(sql)) {
          const target = values[0];
          const found = store.filter((r) => r.target_url === target);
          return found;
        }

        // SELECT by code
        if (/SELECT \* FROM LINKS WHERE CODE/.test(sql)) {
          const code = values[0];
          const found = store.filter((r) => r.code === code);
          return found;
        }

        // INSERT INTO links (code, target_url) VALUES (${shortCode}, ${targetUrl}) RETURNING *
        if (sql.startsWith("INSERT INTO LINKS")) {
          const code = values[0];
          const target_url = values[1];
          const existing = store.find((r) => r.code === code);
          if (existing) {
            const err: any = new Error(
              "duplicate key value violates unique constraint"
            );
            err.code = "23505";
            throw err;
          }
          const row: Row = {
            code,
            target_url,
            clicks: 0,
            created_at: new Date().toISOString(),
            last_clicked: null,
          };
          store.push(row);
          return [row];
        }

        // DELETE FROM links WHERE code = ${code}
        if (/DELETE FROM LINKS WHERE CODE/.test(sql)) {
          const code = values[0];
          const idx = store.findIndex((r) => r.code === code);
          if (idx !== -1) store.splice(idx, 1);
          return [];
        }

        // Default: return empty
        return [];
      };

      return tag;
    })();

// Ensure DB schema exists (idempotent)
let schemaReady: Promise<void> | null = null;
export async function ensureSchema(): Promise<void> {
  if (!url)
    throw new Error("DATABASE_URL is missing. Set it in .env to use the API.");
  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await db`
          CREATE TABLE IF NOT EXISTS links (
            code TEXT PRIMARY KEY,
            target_url TEXT NOT NULL,
            clicks INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_clicked TIMESTAMPTZ
          )
        `;
      } catch (err: any) {
        // Surface a clearer, actionable message for auth/connection errors
        const msg = err?.message || String(err);
        if (
          msg.toLowerCase().includes("password authentication failed") ||
          msg.toLowerCase().includes("authentication failed")
        ) {
          throw new Error(
            `Database authentication failed: ${msg}. Check your DATABASE_URL in .env (username/password).`
          );
        }
        throw err;
      }
    })();
  }
  return schemaReady;
}
